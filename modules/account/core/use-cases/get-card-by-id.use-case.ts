import { ICardQueries } from "../types/card-queries.interface";
import { ISpaceAccessProvider } from "../types/space-access-provider.interface";
import { SessionPayload } from "@/modules/identity/infra/cryptography/jwt-utils";
import { failure, success } from "@/types/result.types";

export interface GetCardByIdUseCaseDTO {
    session: SessionPayload;
    cardId: number;
}

export class GetCardByIdUseCase {
    constructor(
        private readonly cardQueries: ICardQueries,
        private readonly getSpaceAccess: ISpaceAccessProvider
    ) {}

    async execute({ session, cardId }: GetCardByIdUseCaseDTO) {
        try {
            const {
                success: accessSuccess,
                data: accessData,
                error,
            } = await this.getSpaceAccess.execute(session);

            if (!accessSuccess) {
                console.warn(
                    `[GetCardByIdUseCase] Falha de acesso ao espaço para partyId=${session.partyId}, contextId=${session.contextId}:`,
                    error
                );
                return failure(error!);
            }

            const { canViewBalances } = accessData;
            if (!canViewBalances) {
                console.warn(
                    `[GetCardByIdUseCase] Permissão canViewBalances negada para partyId=${session.partyId}, contextId=${session.contextId}`
                );
                return failure("Sem permissão para visualizar os cartões deste contexto!");
            }

            const card = await this.cardQueries.findCardById(
                cardId,
                session.contextId
            );

            if (!card) {
                return failure("Cartão não encontrado.");
            }

            return success(card);
        } catch (error) {
            console.error("[GetCardByIdUseCase] Falha crítica:", error);
            return failure("Ocorreu um erro interno. Tente novamente mais tarde.");
        }
    }
}