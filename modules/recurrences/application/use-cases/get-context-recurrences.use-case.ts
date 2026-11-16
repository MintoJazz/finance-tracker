import { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import { failure, success, Result } from "@/types/result.types";
import type {
    RecurrenceFilters,
    RecurrenceListItem,
} from "../../models/schemas/recurrence-item.schema";
import type { IRecurrenceQueries } from "../interfaces/recurrence-queries.interface";

export interface GetContextRecurrencesUseCaseDTO {
    session: SessionPayload;
    filter?: RecurrenceFilters;
}

export class GetContextRecurrencesUseCase {
    constructor(
        private readonly recurrenceQueries: IRecurrenceQueries,
        private readonly spaceAccessProvider: ISpaceAccessProvider
    ) {}

    async execute({
        session,
        filter,
    }: GetContextRecurrencesUseCaseDTO): Promise<Result<RecurrenceListItem[]>> {
        try {
            const { success: accessSuccess, data: access, error } =
                await this.spaceAccessProvider.execute(session);

            if (!accessSuccess || !access) {
                console.warn(
                    `[GetContextRecurrencesUseCase] Falha de acesso ao espaço para partyId=${session.partyId}, contextId=${session.contextId}:`,
                    error
                );
                return failure(error ?? "Acesso negado ao contexto financeiro");
            }

            const { canViewBalances } = access;
            if (!canViewBalances) {
                console.warn(
                    `[GetContextRecurrencesUseCase] Permissão canViewBalances negada para partyId=${session.partyId}, contextId=${session.contextId}`
                );
                return failure(
                    "Sem permissão para visualizar as recorrências deste contexto!"
                );
            }

            const items = await this.recurrenceQueries.listRecurrencesByContextId(
                session.contextId,
                filter
            );

            return success(items);
        } catch (error) {
            console.error(
                "[GetContextRecurrencesUseCase] Falha crítica:",
                error
            );
            return failure(
                "Ocorreu um erro interno ao carregar as recorrências. Tente novamente mais tarde."
            );
        }
    }
}

