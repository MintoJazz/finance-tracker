import { PageRequest } from "@/types/pagination.types";
import { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import { failure, success } from "@/types/result.types";
import { WalletMovementFilters } from "@/modules/movements/models/wallet-movement.schema";
import { IMovementQueries } from "@/modules/movements/application/interfaces/movement-queries.interface";
import { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import { IBalanceLookupProvider } from "@/modules/movements/application/interfaces/balance-lookup-provider.interface";

export interface GetCardMovementsUseCaseDTO {
    session: SessionPayload;
    cardId: number;
    pageRequest: PageRequest;
    filter?: WalletMovementFilters;
}

export class GetCardMovementsUseCase {
    constructor(
        private readonly movementQueries: IMovementQueries,
        private readonly spaceAccessProvider: ISpaceAccessProvider,
        private readonly balanceLookupProvider: IBalanceLookupProvider
    ) {}

    async execute({
        session,
        cardId,
        pageRequest,
        filter,
    }: GetCardMovementsUseCaseDTO) {
        try {
            const {
                success: accessSuccess,
                data: accessData,
                error,
            } = await this.spaceAccessProvider.execute(session);

            if (!accessSuccess || !accessData) {
                console.warn(
                    `[GetCardMovementsUseCase] Falha de acesso ao espaço para partyId=${session.partyId}, contextId=${session.contextId}:`,
                    error
                );
                return failure(error ?? "Falha ao validar acesso ao contexto.");
            }

            if (!accessData.canViewBalances) {
                console.warn(
                    `[GetCardMovementsUseCase] Permissão canViewBalances negada para partyId=${session.partyId}, contextId=${session.contextId}`
                );
                return failure(
                    "Sem permissão para visualizar as movimentações deste contexto!"
                );
            }

            const card = this.balanceLookupProvider.findCardById
                ? await this.balanceLookupProvider.findCardById(
                      cardId,
                      session.contextId
                  )
                : null;

            if (!card) {
                return failure("Cartão não encontrado.");
            }

            const movementsPage = await this.movementQueries.listWalletMovements(
                cardId,
                pageRequest,
                filter
            );

            return success(movementsPage);
        } catch (error) {
            console.error("[GetCardMovementsUseCase] Falha crítica:", error);
            return failure("Ocorreu um erro interno. Tente novamente mais tarde.");
        }
    }
}
