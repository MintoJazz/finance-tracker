import { PageRequest } from "@/types/pagination.types";
import { ICardQueries } from "../types/card-queries.interface";
import { BaseFilter } from "@/types/filters.types";
import { GetSpaceAccessUseCase } from "@/modules/space/core/use-case/get-acess.use-case";
import { SessionPayload } from "@/modules/identity/infra/cryptography/jwt-utils";
import { failure, success } from "@/types/result.types";

export interface GetContextCardsUseCaseDTO {
    session: SessionPayload;
    pageRequest: PageRequest;
    filter?: BaseFilter;
}

export class GetContextCardsUseCase {
    constructor(
        private readonly cardQueries: ICardQueries,
        private readonly getSpaceAccess: GetSpaceAccessUseCase
    ) {}

    async execute({ session, pageRequest, filter }: GetContextCardsUseCaseDTO) {
        try {
            const { success: accessSuccess, data, error } = await this.getSpaceAccess.execute(session);
            if (!accessSuccess) {
                console.warn(`[GetContextCardsUseCase] Falha de acesso ao espaço para partyId=${session.partyId}, contextId=${session.contextId}:`, error);
                return failure(error!);
            }

            const { canViewBalances } = data;
            if (!canViewBalances) {
                console.warn(`[GetContextCardsUseCase] Permissão canViewBalances negada para partyId=${session.partyId}, contextId=${session.contextId}`);
                return failure("Sem permissão para visualizar os cartões deste contexto!");
            }

            return success(await this.cardQueries.listCardsByContextId(session.contextId, pageRequest, filter));
        } catch (error) {
            console.error("[GetContextCardsUseCase] Falha crítica:", error);
            return failure("Ocorreu um erro interno. Tente novamente mais tarde.");
        }
    }
}
