import { PageRequest } from "@/types/pagination.types";
import { IWalletQueries } from "../types/wallet-queries.interface";
import { BaseFilter } from "@/types/filters.types";
import { GetSpaceAccessUseCase } from "@/modules/space/core/use-case/get-acess.use-case";
import { SessionPayload } from "@/modules/identity/infra/cryptography/jwt-utils";
import { failure, success } from "@/types/result.types";

export interface GetContextWalletsUseCaseDTO {
    session: SessionPayload;
    pageRequest: PageRequest;
    filter?: BaseFilter;
}

export class GetContextWalletsUseCase {
    constructor(
        private readonly balanceQueries: IWalletQueries,
        private readonly getSpaceAccess: GetSpaceAccessUseCase
    ) { }

    async execute({ session, pageRequest, filter }: GetContextWalletsUseCaseDTO) {
        try {
            const { success: accesSuccess, data, error } = await this.getSpaceAccess.execute(session);
            if (!accesSuccess) {
                console.warn(`[GetContextWalletsUseCase] Falha de acesso ao espaço para partyId=${session.partyId}, contextId=${session.contextId}:`, error);
                return failure(error!);
            }

            const { canViewBalances } = data;
            if (!canViewBalances) {
                console.warn(`[GetContextWalletsUseCase] Permissão canViewBalances negada para partyId=${session.partyId}, contextId=${session.contextId}`);
                return failure("Sem permissão para visualizar as carteiras deste contexto!");
            }

            return success(await this.balanceQueries.listWalletsByContextId(session.contextId, pageRequest, filter));
        } catch (error) {
            console.error("[GetContextWalletsUseCase] Falha crítica:", error);
            return failure("Ocorreu um erro interno. Tente novamente mais tarde.");
        }
    }
}