import { endOfDay, format, getYear, parseISO, startOfDay } from "date-fns";
import { BalanceType } from "@/prisma/generated/prisma/client";
import { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import { failure, success, Result } from "@/types/result.types";
import { formatDate } from "@/lib/formatters";
import type { ICycleQueries } from "@/modules/cycles/application/interfaces/cycle-queries.interface";
import { CycleHorizonCalculator } from "@/modules/cycles/application/services/cycle-horizon.calculator";
import { CycleWindowEngine } from "@/modules/cycles/application/services/cycle-window.engine";
import type { CycleItem } from "@/modules/cycles/models/cycle-item.schema";
import type { CycleStatus } from "@/modules/cycles/models/cycle-primitives.schema";
import type {
    MacroHorizonInfo,
    RecurrenceCycleFilters,
    RecurrenceCyclesResult,
} from "../../models/schemas/recurrence-cycle-filters.schema";
import { GetRecurrenceProfileUseCase } from "./get-recurrence-profile.use-case";

export interface GetRecurrenceCyclesInput {
    session: SessionPayload;
    balanceId: number;
    filters?: Partial<RecurrenceCycleFilters>;
    today?: Date;
}

export class GetRecurrenceCyclesUseCase {
    constructor(
        private readonly getRecurrenceProfileUseCase: GetRecurrenceProfileUseCase,
        private readonly cycleQueries: ICycleQueries,
        private readonly spaceAccessProvider: ISpaceAccessProvider
    ) {}

    async execute(
        input: GetRecurrenceCyclesInput
    ): Promise<Result<RecurrenceCyclesResult>> {
        try {
            const { session, balanceId, filters = {} } = input;
            const today = startOfDay(input.today ?? new Date());

            // 0. Validação de acesso ao espaço
            const { success: accessSuccess, data: access, error } =
                await this.spaceAccessProvider.execute(session);

            if (!accessSuccess || !access) {
                console.warn(
                    `[GetRecurrenceCyclesUseCase] Falha de acesso ao espaço para partyId=${session.partyId}, contextId=${session.contextId}:`,
                    error
                );
                return failure(error ?? "Acesso negado ao contexto financeiro");
            }

            if (!access.canViewBalances) {
                console.warn(
                    `[GetRecurrenceCyclesUseCase] Permissão canViewBalances negada para partyId=${session.partyId}, contextId=${session.contextId}`
                );
                return failure(
                    "Sem permissão para visualizar os ciclos deste contexto!"
                );
            }

            // 1. Obter metadados da recorrência
            const profileResult = await this.getRecurrenceProfileUseCase.execute({
                session,
                balanceId,
            });

            if (!profileResult.success || !profileResult.data) {
                return failure(
                    profileResult.error ?? "Recorrência não encontrada."
                );
            }

            const recurrence = profileResult.data;

            // 2. Definição do macro-horizonte
            let horizonFrom: Date;
            let horizonTo: Date;
            let horizon: MacroHorizonInfo;

            if (recurrence.endsAt) {
                // Caso A: Contrato a termo / parcelado (sem paginação, do startsAt ao endsAt)
                const startsAtDate = recurrence.startsAt
                    ? startOfDay(new Date(recurrence.startsAt))
                    : today;
                const endsAtDate = endOfDay(new Date(recurrence.endsAt));
                horizonFrom = startsAtDate;
                horizonTo = endsAtDate;
                horizon = {
                    label: `${formatDate(startsAtDate)} a ${formatDate(endsAtDate)}`,
                    offset: 0,
                    canPrev: false,
                    canNext: false,
                    prevOffset: 0,
                    nextOffset: 0,
                    hasPagination: false, // Oculta setas de navegação
                };
            } else if (filters.from && filters.to) {
                // Caso B: Período customizado da URL
                horizonFrom = startOfDay(parseISO(filters.from));
                horizonTo = endOfDay(parseISO(filters.to));
                horizon = {
                    label: `${formatDate(horizonFrom)} – ${formatDate(horizonTo)}`,
                    offset: 0,
                    canPrev: true,
                    canNext: true,
                    prevOffset: -1,
                    nextOffset: 1,
                    from: filters.from,
                    to: filters.to,
                    isCustom: true,
                    hasPagination: true,
                };
            } else {
                // Caso C: Padrão (CycleHorizonCalculator)
                const offset = filters.offset ?? 0;
                const calc = CycleHorizonCalculator.calculate({
                    frequency: recurrence.frequency,
                    today,
                    offset,
                    mode: "CALENDAR_YEAR",
                });
                horizonFrom = startOfDay(calc.from);
                horizonTo = endOfDay(calc.to);
                const label =
                    recurrence.frequency === "YEARLY"
                        ? `${getYear(horizonFrom)} – ${getYear(horizonTo)}`
                        : `${getYear(horizonFrom)}`;

                horizon = {
                    label,
                    offset,
                    canPrev: true,
                    canNext: true,
                    prevOffset: offset - 1,
                    nextOffset: offset + 1,
                    hasPagination: true,
                };
            }

            // 3. Buscar regras do ciclo a partir do horizonte
            const rules = await this.cycleQueries.findCycleRulesInWindow({
                agreementId: balanceId,
                from: horizonFrom,
                to: horizonTo,
            });

            if (rules.length === 0) {
                return success({
                    horizon,
                    cycles: [],
                });
            }

            // 4. Gerar vigências contíguas com CycleWindowEngine
            const agreementSchedule = {
                frequency: recurrence.frequency,
                interval: recurrence.interval,
                startsAt: recurrence.startsAt
                    ? new Date(recurrence.startsAt)
                    : today,
                endsAt: recurrence.endsAt ? new Date(recurrence.endsAt) : null,
            };

            const windows = CycleWindowEngine.generateWindows({
                agreement: agreementSchedule,
                rules,
                window: {
                    from: horizonFrom,
                    to: horizonTo,
                },
                anchorMode: recurrence.endsAt ? "OVERLAP" : "DUE_DATE",
            });

            if (windows.length === 0) {
                return success({
                    horizon,
                    cycles: [],
                });
            }

            // 5. Mapear filtro de status para agregação SQL
            let mappedStatuses: CycleStatus[] | undefined;
            if (filters.status === "OVERDUE") {
                mappedStatuses = ["OVERDUE"];
            } else if (filters.status === "PAID") {
                mappedStatuses = ["PAID", "SETTLED"];
            } else if (filters.status === "PENDING") {
                mappedStatuses = ["PENDING", "PARTIAL", "OPEN"];
            }

            // 6. Buscar agregações das vigências com CyclePrismaQueries
            const balanceType: BalanceType =
                recurrence.direction === "CREDIT" ? "RECEIVABLE" : "PAYABLE";

            const aggregatedRows = await this.cycleQueries.aggregateCycles({
                balanceId,
                balanceType,
                windows,
                today,
                isOnce: (recurrence.frequency as string) === "ONCE",
                includeProjected: filters.includeProjected !== false,
                statuses: mappedStatuses,
            });

            // 7. Mapear para CycleItemSchema
            const cycles: CycleItem[] = aggregatedRows.map((row) => ({
                from: format(row.from, "yyyy-MM-dd"),
                to: format(row.to, "yyyy-MM-dd"),
                dueDate: format(row.dueDate, "yyyy-MM-dd"),
                closingDate: row.closingDate
                    ? format(row.closingDate, "yyyy-MM-dd")
                    : null,
                label: row.label,
                status: row.status,
                totalAmount: row.totalAmount,
                paidAmount: row.paidAmount,
                remainingAmount: row.remainingAmount,
                isOverdue: row.isOverdue,
                settlementDate: row.settlementDate
                    ? format(row.settlementDate, "yyyy-MM-dd")
                    : null,
                movementsCount: row.movementsCount,
                balanceId: recurrence.balanceId,
                balanceName: recurrence.name,
                balanceType,
                agreementId: recurrence.balanceId,
                referenceDate: format(row.from, "yyyy-MM-dd"),
            }));

            return success({
                horizon,
                cycles,
            });
        } catch (error) {
            console.error(
                `[GetRecurrenceCyclesUseCase] Erro crítico ao buscar ciclos da recorrência ${input.balanceId}:`,
                error
            );
            return failure(
                error instanceof Error
                    ? error.message
                    : "Ocorreu um erro interno ao processar os ciclos da recorrência."
            );
        }
    }
}
