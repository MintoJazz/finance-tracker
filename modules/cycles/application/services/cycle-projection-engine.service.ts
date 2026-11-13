import {
    format,
    isAfter,
    isBefore,
    startOfDay,
} from "date-fns";
import {
    CommitmentCycleFilters,
    CommitmentCycleItem,
    CommitmentCycleStatusEnum,
    CommitmentsPeriodSummary,
} from "@/modules/cycles/models/commitment-cycle.schema";
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
import { CycleSummaryCalculator } from "./cycle-summary.policy";

interface InternalCycleBucket {
    boundaries: CyclePeriodBoundaries;
    rule: CycleRuleWithEntriesData;
    source: AgreementCycleSourceData;
    entries: CycleAggregatedEntryData[];
}

/**
 * Motor puro especializado na projeção em lote de ciclos de compromissos.
 * Responsabilidades:
 * - Projeção de ciclos para tabelas e calendários de visão geral e perfil.
 * - Filtros de texto, status e tipo de saldo sobre coleções de ciclos.
 * - Sumarização de totais do período via CycleSummaryCalculator.
 */
export class CycleProjectionEngine {
    private readonly statusEvaluator: CycleStatusEvaluator<CommitmentCycleStatusEnum>;

    constructor(
        statusEvaluator?: CycleStatusEvaluator<CommitmentCycleStatusEnum>
    ) {
        this.statusEvaluator =
            statusEvaluator ?? CycleStatusRuleEngine.forCommitmentCycle();
    }

    /**
     * Projeta os ciclos para a janela temporal especificada.
     */
    projectCycles(
        sources: AgreementCycleSourceData[],
        window: CycleWindow,
        now: Date
    ): CommitmentCycleItem[] {
        const today = startOfDay(now);
        const winFrom = startOfDay(window.from);
        const winTo = startOfDay(window.to);

        const result: CommitmentCycleItem[] = [];

        for (const source of sources) {
            const agreementStarts = startOfDay(source.startsAt);
            const agreementEnds = source.endsAt ? startOfDay(source.endsAt) : null;

            // Contrato deve estar vigente em algum momento da janela
            if (isAfter(agreementStarts, winTo)) continue;
            if (agreementEnds && isBefore(agreementEnds, winFrom)) continue;

            const rules = [...source.rules].sort(
                (a, b) =>
                    startOfDay(a.effectiveFrom).getTime() -
                    startOfDay(b.effectiveFrom).getTime()
            );

            if (rules.length === 0) continue;

            const bucketsByKey = new Map<string, InternalCycleBucket>();

            // 1. Distribuir entradas pré-agregadas para os baldes de ciclo
            for (const rule of rules) {
                const strategy = CycleEngineRegistry.getStrategy(rule.frequency);

                for (const entry of rule.entries) {
                    const shiftedRef = strategy.resolveReferenceDate(
                        entry.referenceDate,
                        rule
                    );
                    const boundaries = strategy.getCycleBoundaries(shiftedRef, rule);

                    // Só processa se o vencimento do ciclo cair na janela
                    if (
                        isBefore(boundaries.dueDate, winFrom) ||
                        isAfter(boundaries.dueDate, winTo)
                    ) {
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

            // 2. Se o contrato participa da projeção, gerar ciclos projetados na janela
            if (source.includeInProjection) {
                for (let rIdx = 0; rIdx < rules.length; rIdx++) {
                    const rule = rules[rIdx];
                    const nextRule = rules[rIdx + 1];
                    const strategy = CycleEngineRegistry.getStrategy(rule.frequency);

                    const ruleStart = startOfDay(rule.effectiveFrom);
                    const ruleEnd = nextRule ? startOfDay(nextRule.effectiveFrom) : null;
                    const currentPeriodStart = strategy.resolveCurrentPeriodStart(today);

                    if (rule.frequency === "ONCE") {
                        const boundaries = strategy.getCycleBoundaries(
                            rule.effectiveFrom,
                            rule
                        );
                        const dueDateInWindow =
                            !isBefore(boundaries.dueDate, winFrom) &&
                            !isAfter(boundaries.dueDate, winTo);
                        const isNotPastPeriod = !isBefore(
                            boundaries.dueDate,
                            currentPeriodStart
                        );

                        if (dueDateInWindow && isNotPastPeriod) {
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

                    // Projeções iniciam a partir do período corrente em diante
                    const effectiveProjectionStart = isAfter(winFrom, currentPeriodStart)
                        ? winFrom
                        : currentPeriodStart;

                    let cursor = strategy.stepCycle(
                        effectiveProjectionStart,
                        -1,
                        rule.interval
                    );
                    const maxCursor = strategy.stepCycle(winTo, 2, rule.interval);

                    while (!isAfter(cursor, maxCursor)) {
                        const boundaries = strategy.getCycleBoundaries(cursor, rule);

                        // O ciclo pertence a esta regra se o período-base começa dentro da vigência dela
                        const periodStartsAt = boundaries.beginsAt;
                        const belongsToThisRule =
                            !isBefore(periodStartsAt, ruleStart) &&
                            (!ruleEnd || isBefore(periodStartsAt, ruleEnd));

                        // O ciclo deve estar dentro da vigência do contrato
                        const withinAgreement =
                            !isBefore(boundaries.endsAt, agreementStarts) &&
                            (!agreementEnds || !isAfter(boundaries.beginsAt, agreementEnds));

                        // O vencimento deve cair dentro da janela solicitada
                        const dueDateInWindow =
                            !isBefore(boundaries.dueDate, winFrom) &&
                            !isAfter(boundaries.dueDate, winTo);

                        // Ciclos puramente projetados não devem pertencer a períodos anteriores ao período corrente
                        const isNotPastPeriod = !isBefore(
                            boundaries.dueDate,
                            currentPeriodStart
                        );

                        if (
                            belongsToThisRule &&
                            withinAgreement &&
                            dueDateInWindow &&
                            isNotPastPeriod
                        ) {
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

            // 3. Processar cada ciclo do contrato
            for (const bucket of bucketsByKey.values()) {
                const { boundaries, entries } = bucket;

                // Direção que aumenta a obrigação
                const directionThatIncreases: "CREDIT" | "DEBIT" =
                    source.balanceType === "RECEIVABLE" ? "CREDIT" : "DEBIT";

                let recognizedAmount = 0;
                let paidAmount = 0;
                let totalEntriesCount = 0;
                let latestSettlementDate: Date | null = null;

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

                    const isPaid = [
                        "SETTLEMENT",
                        "CLAIM_PAYMENT",
                        "CLAIM_RECEIPT",
                    ].includes(effectiveType);

                    if (isRecognized) {
                        recognizedAmount += signed;
                    } else if (isPaid) {
                        paidAmount += -signed;
                        if (
                            !latestSettlementDate ||
                            isAfter(entry.referenceDate, latestSettlementDate)
                        ) {
                            latestSettlementDate = entry.referenceDate;
                        }
                    }
                }

                paidAmount = Math.max(0, paidAmount);

                // Valor esperado
                let expectedAmount = 0;
                if (source.balanceType !== "CREDIT") {
                    expectedAmount = this.calculateVigenteAmount(
                        source.amountLog,
                        boundaries.dueDate
                    );
                }

                const totalAmount =
                    recognizedAmount > 0 ? recognizedAmount : expectedAmount;

                const remainingAmount = Math.max(0, totalAmount - paidAmount);

                // Omissão de ciclos de cartão de crédito vazios
                if (
                    source.balanceType === "CREDIT" &&
                    recognizedAmount === 0 &&
                    paidAmount === 0
                ) {
                    continue;
                }

                // Se o contrato tem includeInProjection=false e não possui lançamentos, omitir
                if (!source.includeInProjection && totalEntriesCount === 0) {
                    continue;
                }

                // Ciclos projetados (sem lançamentos reais) devem ser apenas do período corrente ou futuros
                const strategy = CycleEngineRegistry.getStrategy(bucket.rule.frequency);
                const currentPeriodStart = strategy.resolveCurrentPeriodStart(today);
                if (
                    totalEntriesCount === 0 &&
                    isBefore(boundaries.dueDate, currentPeriodStart)
                ) {
                    continue;
                }

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
                });

                const item: CommitmentCycleItem = {
                    cycleKey: boundaries.cycleKey,
                    agreementId: source.agreementId,
                    balanceId: source.balanceId,
                    balanceName: source.balanceName,
                    balanceType:
                        source.balanceType === "CREDIT" ? "CREDIT" : "COMMITMENT",
                    label: boundaries.label,
                    from: format(boundaries.beginsAt, "yyyy-MM-dd"),
                    to: format(boundaries.endsAt, "yyyy-MM-dd"),
                    closingDate: boundaries.closingDate ?? boundaries.dueDate,
                    dueDate: boundaries.dueDate,
                    totalAmount,
                    paidAmount,
                    remainingAmount,
                    status,
                    movementsCount: totalEntriesCount,
                    settlementDate: status === "PAID" ? latestSettlementDate : null,
                };

                result.push(item);
            }
        }

        // Ordenação por dueDate ASC
        result.sort((a, b) => {
            const timeDiff = a.dueDate.getTime() - b.dueDate.getTime();
            if (timeDiff !== 0) return timeDiff;
            return a.balanceId - b.balanceId;
        });

        return result;
    }

    /**
     * Aplica filtros de busca textual, tipo de saldo e status sobre os ciclos.
     * Mantém a ordenação por dueDate ASC.
     */
    applyFilters(
        cycles: CommitmentCycleItem[],
        filter?: CommitmentCycleFilters
    ): CommitmentCycleItem[] {
        if (!filter) return [...cycles];

        let filtered = [...cycles];

        if (filter.q && filter.q.trim().length > 0) {
            const searchLower = filter.q.trim().toLowerCase();
            filtered = filtered.filter(
                (c) =>
                    c.balanceName.toLowerCase().includes(searchLower) ||
                    c.label.toLowerCase().includes(searchLower)
            );
        }

        if (filter.balanceTypes && filter.balanceTypes.length > 0) {
            filtered = filtered.filter((c) =>
                filter.balanceTypes!.includes(c.balanceType)
            );
        }

        if (filter.statuses && filter.statuses.length > 0) {
            filtered = filtered.filter((c) => filter.statuses!.includes(c.status));
        }

        return filtered;
    }

    /**
     * Calcula o resumo de valores e contagens sobre a lista de ciclos via CycleSummaryCalculator.
     */
    summarizeCycles(cycles: CommitmentCycleItem[]): CommitmentsPeriodSummary {
        return CycleSummaryCalculator.summarize(cycles);
    }

    /**
     * Calcula o valor vigente do log append-only na data de referência:
     * valorVigente(data) = max(0, Σ amount das entradas com effectiveAt <= data).
     */
    calculateVigenteAmount(
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

