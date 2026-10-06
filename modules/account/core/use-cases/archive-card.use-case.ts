import { ArchiveCardInput } from "../schemas/card.schema";
import { ICardRepository } from "../types/card-repository.interface";
import { ISpaceAccessProvider } from "../types/space-access-provider.interface";
import { SessionPayload } from "@/modules/identity/infra/cryptography/jwt-utils";
import { failure, success } from "@/types/result.types";

export interface ArchiveCardUseCaseDTO {
    session: SessionPayload;
    data: ArchiveCardInput;
}

export class ArchiveCardUseCase {
    constructor(
        private readonly cardRepository: ICardRepository,
        private readonly getSpaceAccess: ISpaceAccessProvider
    ) {}

    async execute({ session, data }: ArchiveCardUseCaseDTO) {
        try {
            const {
                success: accessSuccess,
                data: accessData,
                error,
            } = await this.getSpaceAccess.execute(session);

            if (!accessSuccess) {
                console.warn(
                    `[ArchiveCardUseCase] Falha de acesso ao espaço para partyId=${session.partyId}, contextId=${session.contextId}:`,
                    error
                );
                return failure(error!);
            }

            const { canManageBalances } = accessData;
            if (!canManageBalances) {
                console.warn(
                    `[ArchiveCardUseCase] Permissão canManageBalances negada para partyId=${session.partyId}, contextId=${session.contextId}`
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

            if (existingCard.isArchived) {
                return failure("Este cartão já está arquivado.");
            }

            const archivedCard = await this.cardRepository.archive(data.id);
            return success(archivedCard);
        } catch (error) {
            console.error("[ArchiveCardUseCase] Falha crítica:", error);
            return failure("Ocorreu um erro interno. Tente novamente mais tarde.");
        }
    }
}