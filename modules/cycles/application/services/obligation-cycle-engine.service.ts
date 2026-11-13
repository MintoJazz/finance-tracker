import {
    addMonths,
    format,
    isAfter,
    isBefore,
    startOfDay,
} from "date-fns";
import {
    CycleStatus,
    CycleView,
} from "@/modules/cycles/models/obligation-cycle.schema";
import {
    AgreementCycleSourceData,
    CycleAggregatedEntryData,
    CycleRuleWithEntriesData,
    CycleWindow,
} from "@/modules/cycles/application/interfaces/commitment-cycle-engine.interface";
import {
    CycleEngineRegistry,
    CyclePeriodBoundaries,
} from "@/modules/cycles/application/services/cycle-engine.registry";
import {
    CycleStatusEvaluator,
    CycleStatusRuleEngine,
} from "./cycle-status.rules";

interface InternalCycleBucket {
    boundaries: CyclePeriodBoundaries;
    rule: CycleRuleWithEntriesData;
    source: AgreementCycleSourceData;
    entries: CycleAggregatedEntryData[];
}

/**
 * Motor puro especializado na projeção de ciclos para o Wizard de Quitação de Obrigações.
 * Responsabilidades:
 * - Projeção de ciclos com limite configurável de meses à frente (maxAdvanceMonths).
 * - Omissão de ciclos de cartão de crédito vazios.
 * - Omissão de ciclos passados vazios (UNRECORDED) e ciclos já quitados (SETTLED).
 * - Avaliação de status especializada para obrigações via CycleStatusChain.
 */
export class ObligationCycleEngine {
    private readonly statusEvaluator: CycleStatusEvaluator<CycleStatus>;

    constructor(statusEvaluator?: CycleStatusEvaluator<CycleStatus>) {
        this.statusEvaluator =
            statusEvaluator ?? CycleStatusRuleEngine.forObligationCycle();
    }

    /**
     * Projeta ciclos para a tela de quitação de obrigações (wizard).
     */
    projectObligationCycles(
        source: AgreementCycleSourceData,
        window: CycleWindow,
        now: Date,
        maxAdvanceMonths: number = 3
    ): CycleView[] {
        const today = startOfDay(now);
        const winFrom = startOfDay(window.from);
        const winTo = startOfDay(window.to);

        const agreementStarts = startOfDay(source.startsAt);
        const agreementEnds = source.endsAt ? startOfDay(source.endsAt) : null;

        const rules = [...source.rules].sort(
            (a, b) =>
                startOfDay(a.effectiveFrom).getTime() -
                startOfDay(b.effectiveFrom).getTime()
        );

        if (rules.length === 0) return [];

        const bucketsByKey = new Map<string, InternalCycleBucket>();

        // 1. Injetar lançamentos reais nos baldes
        for (const rule of rules) {
            const strategy = CycleEngineRegistry.getStrategy(rule.frequency);
            for (const entry of rule.entries) {
                const shiftedRef = strategy.resolveReferenceDate(entry.referenceDate, rule);
                const boundaries = strategy.getCycleBoundaries(shiftedRef, rule);

                if (isBefore(boundaries.dueDate, winFrom) || isAfter(boundaries.dueDate, winTo)) {
                    continue;
                }

                if (!bucketsByKey.has(boundaries.cycleKey)) {
                    bucketsByKey.set(boundaries.cycleKey, {
                        boundaries,
                        rule,
                        source,
                        entries: [],
                    });
                }
                bucketsByKey.get(boundaries.cycleKey)!.entries.push(entry);
            }
        }

        // 2. Se o contrato participa da projeção (e não é CREDIT puro), gerar ciclos na janela até MAX_ADVANCE
        if (source.includeInProjection && source.balanceType !== "CREDIT") {
            for (let rIdx = 0; rIdx < rules.length; rIdx++) {
                const rule = rules[rIdx];
                const nextRule = rules[rIdx + 1];
                const strategy = CycleEngineRegistry.getStrategy(rule.frequency);

                const ruleStart = startOfDay(rule.effectiveFrom);
                const ruleEnd = nextRule ? startOfDay(nextRule.effectiveFrom) : null;
                const currentPeriodStart = strategy.resolveCurrentPeriodStart(today);

                // O maior avanço entre maxAdvanceMonths (ex: 3 meses) e maxAdvanceCycles (ex: 3 ciclos)
                const advanceMonthsDate = addMonths(currentPeriodStart, maxAdvanceMonths);
                const advanceCyclesDate = strategy.stepCycle(currentPeriodStart, maxAdvanceMonths, rule.interval);
                const maxAdvanceDate = isAfter(advanceMonthsDate, advanceCyclesDate)
                    ? advanceMonthsDate
                    : advanceCyclesDate;

                if (rule.frequency === "ONCE") {
                    const boundaries = strategy.getCycleBoundaries(rule.effectiveFrom, rule);
                    const dueDateInWindow =
                        !isBefore(boundaries.dueDate, winFrom) &&
                        !isAfter(boundaries.dueDate, winTo);

                    if (dueDateInWindow && !isAfter(boundaries.dueDate, maxAdvanceDate)) {
                        if (!bucketsByKey.has(boundaries.cycleKey)) {
                            bucketsByKey.set(boundaries.cycleKey, {
                                boundaries,
                                rule,
                                source,
                                entries: [],
                            });
                        }
                    }
                    continue;
                }

                let cursor = currentPeriodStart;
                const maxCursor = strategy.stepCycle(winTo, 1, rule.interval);

                while (!isAfter(cursor, maxCursor)) {
                    const boundaries = strategy.getCycleBoundaries(cursor, rule);
                    const periodStartsAt = boundaries.beginsAt;

                    const belongsToThisRule =
                        !isBefore(periodStartsAt, ruleStart) &&
                        (!ruleEnd || isBefore(periodStartsAt, ruleEnd));

                    const withinAgreement =
                        !isBefore(boundaries.endsAt, agreementStarts) &&
                        (!agreementEnds || !isAfter(boundaries.beginsAt, agreementEnds));

                    const dueDateInWindow =
                        !isBefore(boundaries.dueDate, winFrom) &&
                        !isAfter(boundaries.dueDate, winTo);

                    const notPastMaxAdvance = !isAfter(boundaries.dueDate, maxAdvanceDate);

                    if (belongsToThisRule && withinAgreement && dueDateInWindow && notPastMaxAdvance) {
                        if (!bucketsByKey.has(boundaries.cycleKey)) {
                            bucketsByKey.set(boundaries.cycleKey, {
                                boundaries,
                                rule,
                                source,
                                entries: [],
                            });
                        }
                    }

                    cursor = strategy.stepCycle(cursor, 1, rule.interval);
                }
            }
        }

        // 3. Processar cada ciclo
        const result: CycleView[] = [];

        for (const bucket of bucketsByKey.values()) {
            const { boundaries, entries, rule } = bucket;

            const directionThatIncreases: "CREDIT" | "DEBIT" =
                source.balanceType === "RECEIVABLE" ? "CREDIT" : "DEBIT";

            let recognizedAmount = 0;
            let paidAmount = 0;
            let totalEntriesCount = 0;

            for (const entry of entries) {
                totalEntriesCount += entry.count;

                const signed =
                    entry.direction === directionThatIncreases
                        ? entry.amount
                        : -entry.amount;

                const effectiveType =
                    entry.type === "REVERSAL" && entry.reversesEntryType
                        ? entry.reversesEntryType
                        : entry.type;

                const isRecognized =
                    ["ACCRUAL", "CLAIM_OPENING", "ADJUSTMENT"].includes(effectiveType) ||
                    (effectiveType === "DIRECT" && source.balanceType === "CREDIT");

                const isPaid = ["SETTLEMENT", "CLAIM_PAYMENT", "CLAIM_RECEIPT"].includes(
                    effectiveType
                );

                if (isRecognized) {
                    recognizedAmount += signed;
                } else if (isPaid) {
                    paidAmount += -signed;
                }
            }

            paidAmount = Math.max(0, paidAmount);

            // Omissão de ciclos de cartão de crédito vazios
            if (
                source.balanceType === "CREDIT" &&
                recognizedAmount === 0 &&
                paidAmount === 0
            ) {
                continue;
            }

            let expectedAmount: number | null = null;
            if (source.balanceType !== "CREDIT") {
                expectedAmount = this.calculateVigenteAmount(
                    source.amountLog,
                    boundaries.dueDate
                );
            }

            const totalAmount =
                recognizedAmount > 0 ? recognizedAmount : (expectedAmount ?? 0);
            const remainingAmount = Math.max(0, totalAmount - paidAmount);

            const strategy = CycleEngineRegistry.getStrategy(rule.frequency);
            const currentPeriodStart = strategy.resolveCurrentPeriodStart(today);

            // Determinação de status via Rules Pattern
            const status = this.statusEvaluator.evaluate({
                totalEntriesCount,
                totalAmount,
                paidAmount,
                remainingAmount,
                recognizedAmount,
                dueDate: boundaries.dueDate,
                endsAt: boundaries.endsAt,
                today,
                currentPeriodStart,
            });

            const isOverdue =
                remainingAmount > 0 && isBefore(startOfDay(boundaries.dueDate), today);

            // Na tela de quitação de obrigações, omitir ciclos já liquidados e projeções vazias do passado
            if (status === "SETTLED" || remainingAmount === 0 || status === "UNRECORDED") {
                continue;
            }

            const fromStr = format(boundaries.beginsAt, "yyyy-MM-dd");
            const toStr = format(boundaries.endsAt, "yyyy-MM-dd");
            const dueStr = format(boundaries.dueDate, "yyyy-MM-dd");

            result.push({
                agreementId: source.agreementId,
                from: fromStr,
                to: toStr,
                referenceDate: fromStr,
                dueDate: dueStr,
                totalAmount: expectedAmount ?? 0,
                paidAmount,
                remainingAmount,
                expected: expectedAmount,
                accrued: recognizedAmount,
                settled: paidAmount,
                outstanding: remainingAmount,
                status,
                isOverdue,
                label: boundaries.label,
            });
        }

        result.sort((a, b) => {
            const timeDiff = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            if (timeDiff !== 0) return timeDiff;
            return a.referenceDate.localeCompare(b.referenceDate);
        });

        return result;
    }

    /**
     * Calcula o valor vigente do log append-only na data de referência:
     * valorVigente(data) = max(0, Σ amount das entradas com effectiveAt <= data).
     */
    private calculateVigenteAmount(
        amountLog: { amount: number; effectiveAt: Date }[],
        targetDate: Date
    ): number {
        const targetCivil = startOfDay(targetDate);
        let sum = 0;
        for (const entry of amountLog) {
            if (!isAfter(startOfDay(entry.effectiveAt), targetCivil)) {
                sum += entry.amount;
            }
        }
        return Math.max(0, sum);
    }
}

