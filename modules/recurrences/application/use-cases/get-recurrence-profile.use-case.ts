import { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import { failure, success, Result } from "@/types/result.types";
import type { RecurrenceProfile } from "../../models/schemas/recurrence-profile.schema";
import type { IRecurrenceQueries } from "../interfaces/recurrence-queries.interface";

export interface GetRecurrenceProfileInput {
    session: SessionPayload;
    balanceId: number;
}

export class GetRecurrenceProfileUseCase {
    constructor(
        private readonly recurrenceQueries: IRecurrenceQueries,
        private readonly spaceAccessProvider: ISpaceAccessProvider
    ) {}

    async execute({
        session,
        balanceId,
    }: GetRecurrenceProfileInput): Promise<Result<RecurrenceProfile>> {
        try {
            const { success: accessSuccess, data: access, error } =
                await this.spaceAccessProvider.execute(session);

            if (!accessSuccess || !access) {
                console.warn(
                    `[GetRecurrenceProfileUseCase] Falha de acesso ao espaço para partyId=${session.partyId}, contextId=${session.contextId}:`,
                    error
                );
                return failure(error ?? "Acesso negado ao contexto financeiro");
            }

            const { canViewBalances } = access;
            if (!canViewBalances) {
                console.warn(
                    `[GetRecurrenceProfileUseCase] Permissão canViewBalances negada para partyId=${session.partyId}, contextId=${session.contextId}`
                );
                return failure(
                    "Sem permissão para visualizar os dados desta recorrência!"
                );
            }

            const recurrence = await this.recurrenceQueries.findRecurrenceById(
                balanceId,
                session.contextId
            );

            if (!recurrence) {
                return failure("Recorrência não encontrada.");
            }

            const profile: RecurrenceProfile = {
                ...recurrence,
                description: null,
            };

            return success(profile);
        } catch (error) {
            console.error(
                `[GetRecurrenceProfileUseCase] Falha crítica ao buscar recorrência ${balanceId}:`,
                error
            );
            return failure(
                error instanceof Error
                    ? error.message
                    : "Ocorreu um erro interno ao carregar os dados da recorrência."
            );
        }
    }
}

