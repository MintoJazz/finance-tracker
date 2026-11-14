import { addDays, format, parseISO, startOfDay, subDays } from "date-fns";
import { BalanceType, CycleFrequency } from "@/prisma/generated/prisma/client";
import {
    CycleRange,
    CycleStatus,
} from "@/modules/cycles/models/cycle-primitives.schema";
import { CycleWindowEngine } from "@/modules/cycles/application/services/cycle-window.engine";
import { CycleDetailValidator } from "@/modules/cycles/application/services/cycle-detail.validator";
import { ICycleQueries } from "../interfaces/cycle-queries.interface";

export interface GetCycleDetailInput {
    contextId: number;
    balanceId: number;
    range: CycleRange; // { from: 'YYYY-MM-DD', to: 'YYYY-MM-DD' }
    today?: Date;
}

export interface CycleDetailOutput {
    balance: {
        id: number;
        name: string;
        balanceType: BalanceType;
        frequency: CycleFrequency;
        interval: number;
    };
    cycle: {
        range: CycleRange;
        label: string;
        dueDate: string;
        closingDate: string | null;
        settlementDate: string | null;
        status: CycleStatus;
        isConsolidated: boolean;
        isOverdue: boolean;
        isBridgeCycle: boolean;
        hasReceipt: boolean;
        movementsCount: number;
        amounts: {
            total: number;
            recognized: number;
            paid: number;
            transferred: number;
            remaining: number;
        };
    };
    rule: {
        id: number;
        effectiveFrom: string;
        dueDay: number;
        dueMonth: number | null;
        closingDay: number | null;
        closingMonth: number | null;
    };
    navigation: {
        prev: CycleRange | null;
        next: CycleRange | null;
    };
}

export type GetCycleDetailError =
    | { code: "AGREEMENT_NOT_FOUND"; message: string }
    | { code: "CYCLE_RULES_NOT_FOUND"; message: string }
    | { code: "INVALID_RANGE_ORDER"; message: string }
    | { code: "OUT_OF_AGREEMENT_BOUNDS"; message: string }
    | { code: "NON_CANONICAL_CYCLE_WINDOW"; message: string }
    | { code: "AGGREGATION_FAILED"; message: string };

export type GetCycleDetailResult =
    | { ok: true; data: CycleDetailOutput }
    | { ok: false; error: GetCycleDetailError };

export class GetCycleDetailUseCase {
    constructor(private readonly cycleQueries: ICycleQueries) {}

    async execute(input: GetCycleDetailInput): Promise<GetCycleDetailResult> {
        const { contextId, balanceId, range } = input;
        const today = startOfDay(input.today ?? new Date());

        // ====================================================================
        // PASSO 1: Busca Metadados Leves (Balance + Agreement)
        // ====================================================================
        const agreementCtx = await this.cycleQueries.findAgreementContext(
            balanceId,
            contextId
        );

        if (!agreementCtx) {
            return {
                ok: false,
                error: {
                    code: "AGREEMENT_NOT_FOUND",
                    message: `Acordo ou cartão (balanceId=${balanceId}) não encontrado neste contexto.`,
                },
            };
        }

        // ====================================================================
        // PASSO 2: Janela da Vizinhança [-1 dia, +1 dia]
        // Como os ciclos são contíguos:
        // - subDays(reqFrom, 1) é o último dia do ciclo anterior (prev)
        // - addDays(reqTo, 1) é o primeiro dia do próximo ciclo (next)
        // ====================================================================
        const reqFrom = startOfDay(parseISO(range.from));
        const reqTo = startOfDay(parseISO(range.to));

        const neighborhoodWindow = {
            from: subDays(reqFrom, 1),
            to: addDays(reqTo, 1),
        };

        // ====================================================================
        // PASSO 3: Busca Regras da Vizinhança (com 1 de folga para cada lado)
        // ====================================================================
        const rules = await this.cycleQueries.findCycleRulesInWindow({
            agreementId: agreementCtx.balanceId,
            from: neighborhoodWindow.from,
            to: neighborhoodWindow.to,
        });

        if (rules.length === 0) {
            return {
                ok: false,
                error: {
                    code: "CYCLE_RULES_NOT_FOUND",
                    message: `Nenhuma regra de ciclo configurada para o acordo ${balanceId}.`,
                },
            };
        }

        // ====================================================================
        // PASSO 4: Gera as Vigências [prev, current, next] e Valida o `current`
        // ====================================================================
        const scheduleContext = {
            frequency: agreementCtx.frequency,
            interval: agreementCtx.interval,
            startsAt: agreementCtx.startsAt,
            endsAt: agreementCtx.endsAt,
        };

        const candidateWindows = CycleWindowEngine.generateWindows({
            agreement: scheduleContext,
            rules,
            window: neighborhoodWindow,
            anchorMode: "OVERLAP",
        });

        const validation = CycleDetailValidator.validateAndExtractNeighborhood({
            requestedRange: range,
            agreement: scheduleContext,
            generatedWindows: candidateWindows,
        });

        if (!validation.ok) {
            return {
                ok: false,
                error: validation.error,
            };
        }

        const { prev, current, next } = validation.value;

        // ====================================================================
        // PASSO 5: Agregação SQL apenas para a vigência `current`
        // (includeProjected = true garante que faturas de cartão vazias ou
        // parcelas futuras retornem normalmente com valores zerados/projetados)
        // ====================================================================
        const aggregatedRows = await this.cycleQueries.aggregateCycles({
            balanceId: agreementCtx.balanceId,
            balanceType: agreementCtx.balanceType,
            windows: [current],
            today,
            isOnce: agreementCtx.frequency === "ONCE",
            includeProjected: true,
        });

        const aggregated = aggregatedRows[0];
        if (!aggregated) {
            return {
                ok: false,
                error: {
                    code: "AGGREGATION_FAILED",
                    message: "Não foi possível agregar os dados financeiros do ciclo solicitado.",
                },
            };
        }

        // ====================================================================
        // PASSO 6: Mapeamento Final para o DTO de Saída
        // ====================================================================
        return {
            ok: true,
            data: {
                balance: {
                    id: agreementCtx.balanceId,
                    name: agreementCtx.balanceName,
                    balanceType: agreementCtx.balanceType,
                    frequency: agreementCtx.frequency,
                    interval: agreementCtx.interval,
                },
                cycle: {
                    range: current.range,
                    label: aggregated.label,
                    dueDate: format(aggregated.dueDate, "yyyy-MM-dd"),
                    closingDate: aggregated.closingDate
                        ? format(aggregated.closingDate, "yyyy-MM-dd")
                        : null,
                    settlementDate: aggregated.settlementDate
                        ? format(aggregated.settlementDate, "yyyy-MM-dd")
                        : null,
                    status: aggregated.status,
                    isConsolidated: aggregated.isConsolidated,
                    isOverdue: aggregated.isOverdue,
                    isBridgeCycle: current.isBridgeCycle,
                    hasReceipt: aggregated.hasReceipt,
                    movementsCount: aggregated.movementsCount,
                    amounts: {
                        total: aggregated.totalAmount,
                        recognized: aggregated.recognizedAmount,
                        paid: aggregated.paidAmount,
                        transferred: aggregated.transferredAmount,
                        remaining: aggregated.remainingAmount,
                    },
                },
                rule: {
                    id: current.rule.id,
                    effectiveFrom: format(current.rule.effectiveFrom, "yyyy-MM-dd"),
                    dueDay: current.rule.dueDay,
                    dueMonth: current.rule.dueMonth,
                    closingDay: current.rule.closingDay,
                    closingMonth: current.rule.closingMonth,
                },
                navigation: {
                    prev: prev ? prev.range : null,
                    next: next ? next.range : null,
                },
            },
        };
    }
}