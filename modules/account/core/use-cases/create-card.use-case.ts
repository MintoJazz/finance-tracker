import { CreateCardFormValues } from "../schemas/card.schema";
import { ICardRepository } from "../types/card-repository.interface";
import { ISpaceAccessProvider } from "../types/space-access-provider.interface";
import { SessionPayload } from "@/modules/identity/infra/cryptography/jwt-utils";
import { failure, success } from "@/types/result.types";

export interface CreateCardUseCaseDTO {
    session: SessionPayload;
    data: CreateCardFormValues;
}

export class CreateCardUseCase {
    constructor(
        private readonly cardRepository: ICardRepository,
        private readonly getSpaceAccess: ISpaceAccessProvider
    ) {}

    async execute({ session, data }: CreateCardUseCaseDTO) {
        try {
            const {
                success: accessSuccess,
                data: accessData,
                error,
            } = await this.getSpaceAccess.execute(session);

            if (!accessSuccess) {
                console.warn(
                    `[CreateCardUseCase] Falha de acesso ao espaço para partyId=${session.partyId}, contextId=${session.contextId}:`,
                    error
                );
                return failure(error!);
            }

            const { canManageBalances } = accessData;
            if (!canManageBalances) {
                console.warn(
                    `[CreateCardUseCase] Permissão canManageBalances negada para partyId=${session.partyId}, contextId=${session.contextId}`
                );
                return failure("Sem permissão para criar cartões neste contexto!");
            }

            const createdCard = await this.cardRepository.create({
                contextId: session.contextId,
                name: data.name,
                limit: data.limit,
                closingDay: data.closingDay,
                dueDay: data.dueDay,
            });

            return success(createdCard);
        } catch (error) {
            console.error("[CreateCardUseCase] Falha crítica:", error);
            return failure("Ocorreu um erro interno. Tente novamente mais tarde.");
        }
    }
}