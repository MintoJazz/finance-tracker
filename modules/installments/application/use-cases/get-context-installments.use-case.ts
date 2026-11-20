import { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import { failure, success, Result } from "@/types/result.types";
import type {
    InstallmentFilters,
    InstallmentListItem,
} from "../../models/schemas/installment-item.schema";
import type { IInstallmentQueries } from "../interfaces/installment-queries.interface";

export interface GetContextInstallmentsUseCaseDTO {
    session: SessionPayload;
    filter?: InstallmentFilters;
}

export class GetContextInstallmentsUseCase {
    constructor(
        private readonly installmentQueries: IInstallmentQueries,
        private readonly spaceAccessProvider: ISpaceAccessProvider
    ) {}

    async execute({
        session,
        filter,
    }: GetContextInstallmentsUseCaseDTO): Promise<Result<InstallmentListItem[]>> {
        try {
            const { success: accessSuccess, data: access, error } =
                await this.spaceAccessProvider.execute(session);

            if (!accessSuccess || !access) {
                console.warn(
                    `[GetContextInstallmentsUseCase] Falha de acesso ao espaço para partyId=${session.partyId}, contextId=${session.contextId}:`,
                    error
                );
                return failure(error ?? "Acesso negado ao contexto financeiro");
            }

            if (!access.canViewBalances) {
                console.warn(
                    `[GetContextInstallmentsUseCase] Permissão canViewBalances negada para partyId=${session.partyId}, contextId=${session.contextId}`
                );
                return failure(
                    "Sem permissão para visualizar os parcelamentos deste contexto!"
                );
            }

            const items =
                await this.installmentQueries.listInstallmentsByContextId(
                    session.contextId,
                    filter
                );

            return success(items);
        } catch (error) {
            console.error("[GetContextInstallmentsUseCase] Falha crítica:", error);
            return failure(
                "Ocorreu um erro interno ao carregar os parcelamentos. Tente novamente mais tarde."
            );
        }
    }
}
