import { addDays, format, isAfter, isBefore, startOfDay } from "date-fns";
import { failure, Result, success } from "@/types/result.types";
import { CycleDetail } from "@/modules/cycles/models/cycle-detail.schema";
import { CycleRange } from "@/modules/cycles/models/cycle-primitives.schema";
import {
    CycleAggregatedAmounts,
    CycleRuleItem,
} from "@/modules/cycles/application/interfaces/cycle-queries.interface";
import { CycleEngineRegistry } from "@/modules/cycles/application/services/cycle-engine.registry";
import {
    CycleStatusEvaluator,
    CycleStatusRuleEngine,
} from "./cycle-status.rules";
import { CommitmentCycleStatusEnum } from "@/modules/cycles/models/commitment-cycle.schema";
import {
    CycleDetailValidator,
    parseCivilDate,
} from "./cycle-detail.validator";

export interface CycleWindowBoundaries {
    range: CycleRange;
    dueDate: Date;
    closingDate: Date | null;
    label: string;
    rule: CycleRuleItem;
}

export interface CycleWindowsResolution {
    current: CycleWindowBoundaries;
    prev: CycleWindowBoundaries | null;
    next: CycleWindowBoundaries | null;
}

export interface CalculateCycleAmountsParams {
    balanceType:
        | "CREDIT"
        | "PAYABLE"
        | "RECEIVABLE"
        | "WALLET"
        | "RESERVE"
        | "CATEGORY";
    aggregated: CycleAggregatedAmounts;
    currentDueDate: Date;
    amountLog?: Array<{ amount: number; effectiveAt: Date }>;
}

export interface BuildCycleDetailParams {
    balance: {
        id: number;
        name: string;
        balanceType:
            | "CREDIT"
            | "PAYABLE"
            | "RECEIVABLE"
            | "WALLET"
            | "RESERVE"
            | "CATEGORY";
    };
    agreement: {
        startsAt: Date;
        endsAt: Date | null;
        includeInProjection: boolean;
    };
    windows: CycleWindowsResolution;
    amounts: {
        total: number;
        paid: number;
        open: number;
        transferred: number;
        recognized?: number;
    };
    movementsCount: number;
    latestSettlementDate: Date | null;
    hasReceipt: boolean;
    now: Date;
    kind?: "CARD" | "CONTRACT";
    statusEvaluator?: CycleStatusEvaluator<CommitmentCycleStatusEnum>;
}

/**
 * Motor puro especializado no ciclo individual (Visão de Extrato de Ciclo).
 * Responsabilidades:
 * - Validação de períodos contra regras ativas e ciclos ponte (bridge cycles).
 * - Resolução contínua de ciclos irmãos (prev e next).
 * - Cálculo de polaridade contábil e saldos pós-agregação no banco.
 * - Montagem do objeto de domínio CycleDetail.
 */
export class CycleDetailEngine {
    private readonly statusEvaluator: CycleStatusEvaluator<CommitmentCycleStatusEnum>;

    constructor(
        statusEvaluator?: CycleStatusEvaluator<CommitmentCycleStatusEnum>
    ) {
        this.statusEvaluator =
            statusEvaluator ?? CycleStatusRuleEngine.forCommitmentCycle();
    }

    /**
     * Valida se o período (range) informado pelo frontend é compatível com as regras vigentes
     * e calcula as 3 janelas temporais contíguas (current, prev, next) com suas respectivas regras.
     */
    validateAndResolveWindows(
        rules: CycleRuleItem[],
        agreement: { startsAt: Date; endsAt: Date | null },
        range: CycleRange
    ): Result<CycleWindowsResolution> {
        const rulesValidation = CycleDetailValidator.validateRulesNotEmpty(rules);
        if (!rulesValidation.success) {
            return failure(rulesValidation.error);
        }

        const sortedRules = [...rules].sort(
            (a, b) =>
                startOfDay(a.effectiveFrom).getTime() -
                startOfDay(b.effectiveFrom).getTime()
        );

        const targetFrom = startOfDay(parseCivilDate(range.from));

        // 1. Resolver o ciclo legítimo para a data inicial informada
        const current = this.resolveCycleForDate(targetFrom, sortedRules);

        const windowValidation = CycleDetailValidator.validateResolvedWindow({
            requestedRange: range,
            resolvedCurrent: current,
            agreement,
        });
        if (!windowValidation.success) {
            return failure(windowValidation.error);
        }

        // 2. Resolver ciclo anterior (prev)
        const prevCursor = startOfDay(
            addDays(parseCivilDate(current.range.from), -1)
        );
        let prev: CycleWindowBoundaries | null = null;

        if (!isBefore(prevCursor, startOfDay(agreement.startsAt))) {
            const prevCandidate = this.resolveCycleForDate(prevCursor, sortedRules);
            if (
                !isBefore(
                    parseCivilDate(prevCandidate.range.to),
                    startOfDay(agreement.startsAt)
                )
            ) {
                prev = prevCandidate;
            }
        }

        // 3. Resolver próximo ciclo (next)
        const nextCursor = startOfDay(
            addDays(parseCivilDate(current.range.to), 1)
        );
        let next: CycleWindowBoundaries | null = null;

        if (!agreement.endsAt || !isAfter(nextCursor, startOfDay(agreement.endsAt))) {
            const nextCandidate = this.resolveCycleForDate(nextCursor, sortedRules);
            if (
                !agreement.endsAt ||
                !isAfter(
                    parseCivilDate(nextCandidate.range.from),
                    startOfDay(agreement.endsAt)
                )
            ) {
                next = nextCandidate;
            }
        }

        return success({
            current,
            prev,
            next,
        });
    }

    /**
     * Resolve os limites canônicos de um ciclo para uma determinada data civil cursor,
     * incluindo transições entre regras (ciclos ponte / bridge cycles).
     */
    resolveCycleForDate(
        cursor: Date,
        sortedRules: CycleRuleItem[]
    ): CycleWindowBoundaries {
        if (!sortedRules || sortedRules.length === 0) {
            throw new Error(
                "Nenhuma regra de ciclo fornecida para resolução de janela."
            );
        }

        const cursorCivil = startOfDay(cursor);
        const pastRules = sortedRules.filter(
            (r) => !isAfter(startOfDay(r.effectiveFrom), cursorCivil)
        );
        const activeRule =
            pastRules.length > 0
                ? pastRules.at(-1)!
                : sortedRules[0]!;
        const strategy = CycleEngineRegistry.getStrategy(activeRule.frequency);
        const shifted = strategy.resolveReferenceDate(cursorCivil, activeRule);
        const boundaries = strategy.getCycleBoundaries(shifted, activeRule);

        // Verifica se há transição de regra dentro deste ciclo
        const transitionRule = sortedRules.find(
            (r) =>
                isAfter(startOfDay(r.effectiveFrom), startOfDay(activeRule.effectiveFrom)) &&
                isAfter(startOfDay(r.effectiveFrom), boundaries.beginsAt) &&
                !isAfter(startOfDay(r.effectiveFrom), boundaries.endsAt)
        );

        if (transitionRule) {
            const transStrategy = CycleEngineRegistry.getStrategy(
                transitionRule.frequency
            );
            const shiftedTrans = transStrategy.resolveReferenceDate(
                startOfDay(transitionRule.effectiveFrom),
                transitionRule
            );
            const transBoundaries = transStrategy.getCycleBoundaries(
                shiftedTrans,
                transitionRule
            );

            return {
                range: {
                    from: format(boundaries.beginsAt, "yyyy-MM-dd"),
                    to: format(transBoundaries.endsAt, "yyyy-MM-dd"),
                },
                dueDate: transBoundaries.dueDate,
                closingDate: transBoundaries.closingDate ?? transBoundaries.dueDate,
                label: transBoundaries.label,
                rule: transitionRule,
            };
        }

        // Suporte simétrico reverso quando cursor está na regra nova (ex: chamado via prevCursor no fim do ciclo ponte)
        if (!transitionRule && pastRules.length > 1) {
            const prevRule = pastRules[pastRules.length - 2]!;
            const prevStrategy = CycleEngineRegistry.getStrategy(
                prevRule.frequency
            );
            const dayBeforeActive = startOfDay(
                addDays(startOfDay(activeRule.effectiveFrom), -1)
            );
            const prevShifted = prevStrategy.resolveReferenceDate(
                dayBeforeActive,
                prevRule
            );
            const prevBoundaries = prevStrategy.getCycleBoundaries(
                prevShifted,
                prevRule
            );

            // Primeiro fechamento da regra ativa
            const firstActiveShifted = strategy.resolveReferenceDate(
                startOfDay(activeRule.effectiveFrom),
                activeRule
            );
            const firstActiveBoundaries = strategy.getCycleBoundaries(
                firstActiveShifted,
                activeRule
            );

            if (
                isAfter(prevBoundaries.endsAt, dayBeforeActive) &&
                !isAfter(cursorCivil, firstActiveBoundaries.endsAt) &&
                !isBefore(cursorCivil, prevBoundaries.beginsAt)
            ) {
                return {
                    range: {
                        from: format(prevBoundaries.beginsAt, "yyyy-MM-dd"),
                        to: format(firstActiveBoundaries.endsAt, "yyyy-MM-dd"),
                    },
                    dueDate: firstActiveBoundaries.dueDate,
                    closingDate:
                        firstActiveBoundaries.closingDate ??
                        firstActiveBoundaries.dueDate,
                    label: firstActiveBoundaries.label,
                    rule: activeRule,
                };
            }
        }

        return {
            range: {
                from: format(boundaries.beginsAt, "yyyy-MM-dd"),
                to: format(boundaries.endsAt, "yyyy-MM-dd"),
            },
            dueDate: boundaries.dueDate,
            closingDate: boundaries.closingDate ?? boundaries.dueDate,
            label: boundaries.label,
            rule: activeRule,
        };
    }

    /**
     * Calcula os saldos { total, paid, open, transferred, recognized } de forma centralizada e pura.
     * Trata movimentos reais (polaridade) e ciclos sem lançamentos (amountLog ou zero).
     */
    calculateCycleAmounts(params: CalculateCycleAmountsParams): {
        total: number;
        paid: number;
        open: number;
        transferred: number;
        recognized?: number;
    } {
        const { balanceType, aggregated, currentDueDate, amountLog } = params;
        const {
            movementsCount,
            recognizedSignedAmount,
            settledSignedAmount,
            transferredSignedAmount,
            netSignedAmount,
        } = aggregated;

        const transferred = Math.abs(transferredSignedAmount);

        // 1. Ciclo sem movimentações (Early Return limpo, sem acoplamento a balanceType)
        if (movementsCount === 0) {
            const expected =
                amountLog && amountLog.length > 0
                    ? this.calculateVigenteAmount(amountLog, currentDueDate)
                    : 0;
            return {
                total: expected,
                paid: 0,
                open: expected,
                transferred,
                recognized: 0,
            };
        }

        // 2. Ciclo com lançamentos reais
        let total = 0;
        let paid = 0;
        let open = 0;
        let recognized = 0;

        if (balanceType === "PAYABLE" || balanceType === "CREDIT") {
            recognized = Math.abs(recognizedSignedAmount);
            paid = Math.max(0, settledSignedAmount);
            total = recognized > 0 ? recognized : paid;
            open = Math.max(0, -netSignedAmount);
        } else if (balanceType === "RECEIVABLE") {
            recognized = Math.max(0, recognizedSignedAmount);
            paid = Math.abs(Math.min(0, settledSignedAmount));
            total = recognized > 0 ? recognized : paid;
            open = Math.max(0, netSignedAmount);
        } else {
            recognized = Math.abs(recognizedSignedAmount);
            paid = Math.abs(settledSignedAmount);
            total = recognized;
            open = Math.max(0, total - paid);
        }

        return {
            total,
            paid,
            open,
            transferred,
            recognized,
        };
    }

    /**
     * Orquestra a montagem do CycleDetail canônico a partir dos dados do ciclo,
     * janelas resolvidas e saldos calculados.
     */
    calculateCycleDetail(params: BuildCycleDetailParams): CycleDetail {
        const {
            balance,
            windows,
            amounts,
            movementsCount,
            latestSettlementDate,
            hasReceipt,
            now,
        } = params;

        const isOverdue =
            amounts.open > 0 &&
            isBefore(startOfDay(windows.current.dueDate), startOfDay(now));

        // Inversão de controle e resolução desacoplada
        const evaluator = params.statusEvaluator ?? this.statusEvaluator;
        const cycleEndsAt = parseCivilDate(windows.current.range.to);
        const recognizedAmount =
            amounts.recognized ?? (movementsCount > 0 ? amounts.total : 0);

        // Avaliação de status via Rules Pattern
        const status = evaluator.evaluate({
            totalEntriesCount: movementsCount,
            totalAmount: amounts.total,
            paidAmount: amounts.paid,
            remainingAmount: amounts.open,
            recognizedAmount,
            transferredAmount: amounts.transferred,
            dueDate: windows.current.dueDate,
            endsAt: cycleEndsAt,
            today: now,
        });

        const kind =
            params.kind ??
            (balance.balanceType === "CREDIT" ? "CARD" : "CONTRACT");
        const mappedBalanceType =
            balance.balanceType === "CREDIT"
                ? "CREDIT"
                : balance.balanceType === "RECEIVABLE"
                ? "RECEIVABLE"
                : "PAYABLE";

        return {
            from: windows.current.range.from,
            to: windows.current.range.to,
            dueDate: format(windows.current.dueDate, "yyyy-MM-dd"),
            closingDate: windows.current.closingDate
                ? format(windows.current.closingDate, "yyyy-MM-dd")
                : null,
            label: windows.current.label,
            status,
            totalAmount: amounts.total,
            paidAmount: amounts.paid,
            remainingAmount: amounts.open,
            isOverdue,
            balanceId: balance.id,
            balanceName: balance.name,
            balanceType: mappedBalanceType,
            movementsCount,
            settlementDate: latestSettlementDate
                ? format(latestSettlementDate, "yyyy-MM-dd")
                : null,
            hasReceipt,
            source: {
                balanceId: balance.id,
                kind,
                name: balance.name,
            },
            amounts: {
                total: amounts.total,
                paid: amounts.paid,
                transferred: amounts.transferred,
                remaining: amounts.open,
            },
            prev: windows.prev ? { ...windows.prev.range } : null,
            next: windows.next ? { ...windows.next.range } : null,
            rule: {
                label: this.formatRuleLabel(windows.current.rule),
                effectiveFrom: format(
                    windows.current.rule.effectiveFrom,
                    "yyyy-MM-dd"
                ),
            },
        };
    }

    /**
     * Formata o rótulo descritivo da regra vigente para a UI.
     */
    formatRuleLabel(rule: CycleRuleItem): string {
        const freqMap: Record<string, string> = {
            MONTHLY: "Mensal",
            WEEKLY: "Semanal",
            YEARLY: "Anual",
            ONCE: "Pontual",
        };

        const freqLabel = freqMap[rule.frequency] ?? rule.frequency;

        if (rule.frequency === "MONTHLY") {
            const dueDayStr = String(rule.dueDay).padStart(2, "0");
            if (rule.closingDay !== null) {
                const closingDayStr = String(rule.closingDay).padStart(2, "0");
                return `${freqLabel} (Fecha dia ${closingDayStr}, Vence dia ${dueDayStr})`;
            }
            return `${freqLabel} (Vence dia ${dueDayStr})`;
        }

        if (rule.frequency === "WEEKLY") {
            const days = [
                "Segunda",
                "Terça",
                "Quarta",
                "Quinta",
                "Sexta",
                "Sábado",
                "Domingo",
            ];
            const dueDayName = days[rule.dueDay - 1] ?? `Dia ${rule.dueDay}`;
            return `${freqLabel} (Vence na ${dueDayName})`;
        }

        return freqLabel;
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
