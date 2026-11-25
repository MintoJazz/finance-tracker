import { startOfDay } from "date-fns";
import { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import { failure, Result, success } from "@/types/result.types";
import { CycleOption } from "@/modules/cycles/models/cycle-option.schema";
import { CycleStatus } from "@/modules/cycles/models/cycle-primitives.schema";
import { ICycleQueries } from "@/modules/cycles/application/interfaces/cycle-queries.interface";
import {
    civilToLocalMidnight,
    utcDateToCivil,
} from "@/modules/agreements/application/services/civil-date";
import { CycleHorizonCalculator } from "@/modules/cycles/application/services/cycle-horizon.calculator";
import { CycleWindowEngine } from "@/modules/cycles/application/services/cycle-window.engine";
import { CycleMapper } from "../../infra/mappers/cycle-option.mapper";

export interface GetCardInvoiceOptionsInput {
    session: SessionPayload;
    balanceId: number; // Mesmo ID do Agreement
    offset?: number;   // Deslocamento do horizonte (default: 0)
    statuses?: CycleStatus[]; // Opcional (ex: filtrar só abertas/pendentes se quiser)
    today?: Date;
}

export class GetCardInvoiceOptionsUseCase {
    constructor(
        private readonly cycleQueries: ICycleQueries,
        private readonly getSpaceAccess: ISpaceAccessProvider
    ) {}

    async execute(
        input: GetCardInvoiceOptionsInput
    ): Promise<Result<CycleOption[]>> {
        try {
            const { session, balanceId, offset = 0, statuses } = input;
            const today = startOfDay(input.today ?? new Date());

            // 1. Validação de acesso ao contexto
            const {
                success: accessSuccess,
                data: accessData,
                error,
            } = await this.getSpaceAccess.execute(session);

            if (!accessSuccess || !accessData) {
                console.warn(
                    `[GetCardInvoiceOptionsUseCase] Falha de acesso ao espaço para partyId=${session.partyId}, contextId=${session.contextId}:`,
                    error
                );
                return failure(error ?? "Falha ao validar acesso ao contexto.");
            }

            if (!accessData.canViewBalances) {
                console.warn(
                    `[GetCardInvoiceOptionsUseCase] Permissão canViewBalances negada para partyId=${session.partyId}, contextId=${session.contextId}`
                );
                return failure(
                    "Sem permissão para visualizar as faturas deste contexto!"
                );
            }

            // 2. Calcula o horizonte direto como MONTHLY (sem ir ao banco buscar Agreement!)
            const horizon = CycleHorizonCalculator.calculate({
                frequency: "MONTHLY",
                today,
                offset,
                mode: "CALENDAR_YEAR", // ou "ROLLING" se preferir 12 meses ao redor de hoje
            });

            // 3. Busca as regras de ciclo do cartão no horizonte (+1 de folga para cada lado)
            const rules = await this.cycleQueries.findCycleRulesInWindow({
                agreementId: balanceId,
                from: horizon.from,
                to: horizon.to,
            });

            if (rules.length === 0) {
                return failure("Nenhuma regra de fechamento/vencimento encontrada para este cartão.");
            }

            // 4. Gera as vigências usando a 1ª regra como startsAt sintético
            const windows = CycleWindowEngine.generateWindows({
                agreement: {
                    frequency: "MONTHLY",
                    interval: 1,
                    startsAt: civilToLocalMidnight(utcDateToCivil(rules[0].effectiveFrom)),
                    endsAt: null,
                },
                rules,
                window: horizon,
                anchorMode: "DUE_DATE",
            });

            if (windows.length === 0) {
                return success([]);
            }

            // 5. Agrega no banco como CREDIT e includeProjected = true (para exibir faturas futuras vazias no select)
            const aggregatedRows = await this.cycleQueries.aggregateCycles({
                balanceId,
                balanceType: "CREDIT",
                windows,
                today,
                isOnce: false,
                includeProjected: true,
                statuses,
            });

            // 6. Mapeia para CycleOption[]
            const options = aggregatedRows.map((row) =>
                CycleMapper.toCycleOption(row, balanceId)
            );

            return success(options);
        } catch (error) {
            console.error("[GetCardInvoiceOptionsUseCase] Falha crítica:", error);
            return failure("Ocorreu um erro interno. Tente novamente mais tarde.");
        }
    }
}