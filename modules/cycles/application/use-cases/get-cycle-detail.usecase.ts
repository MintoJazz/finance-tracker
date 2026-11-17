import { addDays, format, parseISO, startOfDay, subDays } from "date-fns";
import { BalanceType, CycleFrequency } from "@/prisma/generated/prisma/client";
import { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import { failure, Result, success } from "@/types/result.types";
import { toCivilDate } from "@/lib/formatters";
import {
    CycleRange,
    CycleStatus,
} from "@/modules/cycles/models/cycle-primitives.schema";
import { CycleWindowEngine } from "@/modules/cycles/application/services/cycle-window.engine";
import { CycleDetailValidator } from "@/modules/cycles/application/services/cycle-detail.validator";
import { ICycleQueries } from "../interfaces/cycle-queries.interface";

export interface GetCycleDetailInput {
    session: SessionPayload;
    balanceId: number;
    range?: CycleRange; // { from: 'YYYY-MM-DD', to: 'YYYY-MM-DD' } (opcional: se omitido, resolve para today)
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

export class GetCycleDetailUseCase {
    constructor(
        private readonly cycleQueries: ICycleQueries,
        private readonly getSpaceAccess: ISpaceAccessProvider
    ) {}

    async execute(
        input: GetCycleDetailInput
    ): Promise<Result<CycleDetailOutput>> {
        try {
            const { session, balanceId, range } = input;
            const today = startOfDay(input.today ?? new Date());

            // ================================================================
            // PASSO 0: Validação de acesso ao contexto
            // ================================================================
            const {
                success: accessSuccess,
                data: accessData,
                error,
            } = await this.getSpaceAccess.execute(session);

            if (!accessSuccess || !accessData) {
                console.warn(
                    `[GetCycleDetailUseCase] Falha de acesso ao espaço para partyId=${session.partyId}, contextId=${session.contextId}:`,
                    error
                );
                return failure(error ?? "Falha ao validar acesso ao contexto.");
            }

            if (!accessData.canViewBalances) {
                console.warn(
                    `[GetCycleDetailUseCase] Permissão canViewBalances negada para partyId=${session.partyId}, contextId=${session.contextId}`
                );
                return failure(
                    "Sem permissão para visualizar os ciclos deste contexto!"
                );
            }

            // ================================================================
            // PASSO 1: Busca Metadados Leves (Balance + Agreement)
            // ================================================================
            const agreementCtx = await this.cycleQueries.findAgreementContext(
                balanceId,
                session.contextId
            );

            if (!agreementCtx) {
                return failure(
                    `Acordo ou cartão (balanceId=${balanceId}) não encontrado neste contexto.`
                );
            }

            const scheduleContext = {
                frequency: agreementCtx.frequency,
                interval: agreementCtx.interval,
                startsAt: agreementCtx.startsAt,
                endsAt: agreementCtx.endsAt,
            };

            let effectiveRange = range;
            if (!effectiveRange) {
                const rulesAroundToday =
                    await this.cycleQueries.findCycleRulesInWindow({
                        agreementId: agreementCtx.balanceId,
                        from: subDays(today, 60),
                        to: addDays(today, 60),
                    });

                const activeWindow = CycleWindowEngine.resolveWindowForDate(
                    today,
                    scheduleContext,
                    rulesAroundToday
                );

                if (!activeWindow) {
                    return failure(
                        `Não foi possível resolver o ciclo ativo para a data corrente no acordo ${balanceId}.`
                    );
                }
                effectiveRange = activeWindow.range;
            }

            // ================================================================
            // PASSO 2: Janela da Vizinhança [-1 dia, +1 dia]
            // Como os ciclos são contíguos:
            // - subDays(reqFrom, 1) é o último dia do ciclo anterior (prev)
            // - addDays(reqTo, 1) é o primeiro dia do próximo ciclo (next)
            // ================================================================
            const reqFrom = startOfDay(parseISO(effectiveRange.from));
            const reqTo = startOfDay(parseISO(effectiveRange.to));

            const neighborhoodWindow = {
                from: subDays(reqFrom, 1),
                to: addDays(reqTo, 1),
            };

            // ================================================================
            // PASSO 3: Busca Regras da Vizinhança (com 1 de folga para cada lado)
            // ================================================================
            const rules = await this.cycleQueries.findCycleRulesInWindow({
                agreementId: agreementCtx.balanceId,
                from: neighborhoodWindow.from,
                to: neighborhoodWindow.to,
            });

            if (rules.length === 0) {
                return failure(
                    `Nenhuma regra de ciclo configurada para o acordo ${balanceId}.`
                );
            }

            // ================================================================
            // PASSO 4: Gera as Vigências [prev, current, next] e Valida o `current`
            // ================================================================
            const candidateWindows = CycleWindowEngine.generateWindows({
                agreement: scheduleContext,
                rules,
                window: neighborhoodWindow,
                anchorMode: "OVERLAP",
            });

            const validation = CycleDetailValidator.validateAndExtractNeighborhood({
                requestedRange: effectiveRange,
                agreement: scheduleContext,
                generatedWindows: candidateWindows,
            });

            if (!validation.ok) {
                return failure(validation.error.message);
            }

            const { prev, current, next } = validation.value;

            // ================================================================
            // PASSO 5: Agregação SQL apenas para a vigência `current`
            // (includeProjected = true garante que faturas de cartão vazias ou
            // parcelas futuras retornem normalmente com valores zerados/projetados)
            // ================================================================
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
                return failure(
                    "Não foi possível agregar os dados financeiros do ciclo solicitado."
                );
            }

            // ================================================================
            // PASSO 6: Mapeamento Final para o DTO de Saída
            // ================================================================
            // Colunas `date` do $queryRaw chegam como meia-noite UTC; format() no fuso local deslocaria -1 dia.
            const civil = (d: Date) => format(toCivilDate(d), "yyyy-MM-dd");
            return success({
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
                    dueDate: civil(aggregated.dueDate),
                    closingDate: aggregated.closingDate
                        ? civil(aggregated.closingDate)
                        : null,
                    settlementDate: aggregated.settlementDate
                        ? civil(aggregated.settlementDate)
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
                    effectiveFrom: format(
                        current.rule.effectiveFrom,
                        "yyyy-MM-dd"
                    ),
                    dueDay: current.rule.dueDay,
                    dueMonth: current.rule.dueMonth,
                    closingDay: current.rule.closingDay,
                    closingMonth: current.rule.closingMonth,
                },
                navigation: {
                    prev: prev ? prev.range : null,
                    next: next ? next.range : null,
                },
            });
        } catch (error) {
            console.error("[GetCycleDetailUseCase] Falha crítica:", error);
            return failure(
                "Ocorreu um erro interno. Tente novamente mais tarde."
            );
        }
    }
}