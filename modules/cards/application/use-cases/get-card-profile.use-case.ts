import { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import { failure, Result, success } from "@/types/result.types";
import { CardProfile } from "../../models/card-profile.schema";
import { ICardQueries } from "../interfaces/card-queries.interface";

export interface GetCardProfileInput {
    session: SessionPayload;
    cardId: number;
}

export type GetCardProfileUseCaseDTO = GetCardProfileInput;
export type GetCardProfileOutput = CardProfile;

export class GetCardProfileUseCase {
    constructor(
        private readonly cardQueries: ICardQueries,
        private readonly getSpaceAccess: ISpaceAccessProvider
    ) {}

    async execute({
        session,
        cardId,
    }: GetCardProfileInput): Promise<Result<GetCardProfileOutput>> {
        try {
            const {
                success: accessSuccess,
                data: accessData,
                error,
            } = await this.getSpaceAccess.execute(session);

            if (!accessSuccess || !accessData) {
                console.warn(
                    `[GetCardProfileUseCase] Falha de acesso ao espaço para partyId=${session.partyId}, contextId=${session.contextId}:`,
                    error
                );
                return failure(error ?? "Falha ao validar acesso ao contexto.");
            }

            const { canViewBalances } = accessData;
            if (!canViewBalances) {
                console.warn(
                    `[GetCardProfileUseCase] Permissão canViewBalances negada para partyId=${session.partyId}, contextId=${session.contextId}`
                );
                return failure(
                    "Sem permissão para visualizar os cartões deste contexto!"
                );
            }

            const profile = await this.cardQueries.findCardProfileById(
                cardId,
                session.contextId
            );

            if (!profile) {
                return failure("Cartão não encontrado.");
            }

            return success(profile);
        } catch (error) {
            console.error("[GetCardProfileUseCase] Falha crítica:", error);
            return failure("Ocorreu um erro interno. Tente novamente mais tarde.");
        }
    }
}
