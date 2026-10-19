import { RestoreCardInput } from "../schemas/card.schema";
import { ICardRepository } from "../types/card-repository.interface";
import { ISpaceAccessProvider } from "../types/space-access-provider.interface";
import { SessionPayload } from "@/modules/identity/infra/cryptography/jwt-utils";
import { failure, success } from "@/types/result.types";

export interface RestoreCardUseCaseDTO {
    session: SessionPayload;
    data: RestoreCardInput;
}

export class RestoreCardUseCase {
    constructor(
        private readonly cardRepository: ICardRepository,
        private readonly getSpaceAccess: ISpaceAccessProvider
    ) {}

    async execute({ session, data }: RestoreCardUseCaseDTO) {
        try {
            const {
                success: accessSuccess,
                data: accessData,
                error,
            } = await this.getSpaceAccess.execute(session);

            if (!accessSuccess) {
                console.warn(
                    `[RestoreCardUseCase] Falha de acesso ao espaço para partyId=${session.partyId}, contextId=${session.contextId}:`,
                    error
                );
                return failure(error!);
            }

            const { canManageBalances } = accessData;
            if (!canManageBalances) {
                console.warn(
                    `[RestoreCardUseCase] Permissão canManageBalances negada para partyId=${session.partyId}, contextId=${session.contextId}`
                );
                return failure("Sem permissão para gerenciar os cartões deste contexto!");
            }

            const existingCard = await this.cardRepository.findByIdAndContextId(
                data.id,
                session.contextId
            );

            if (!existingCard) {
                return failure("Cartão não encontrado.");
            }

            if (!existingCard.isArchived) {
                return failure("Este cartão não está arquivado.");
            }

            const restoredCard = await this.cardRepository.restore(
                data.id,
                session.contextId
            );
            return success(restoredCard);
        } catch (error) {
            console.error("[RestoreCardUseCase] Falha crítica:", error);
            return failure("Ocorreu um erro interno. Tente novamente mais tarde.");
        }
    }
}