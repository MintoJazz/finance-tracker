import { IWalletQueries } from "../interfaces/wallet-queries.interface";
import { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import { failure, success } from "@/types/result.types";

export interface GetWalletByIdUseCaseDTO {
    session: SessionPayload;
    walletId: number;
}

export class GetWalletByIdUseCase {
    constructor(
        private readonly walletQueries: IWalletQueries,
        private readonly getSpaceAccess: ISpaceAccessProvider
    ) { }

    async execute({ session, walletId }: GetWalletByIdUseCaseDTO) {
        try {
            const { success: accessSuccess, data: accessData, error } = await this.getSpaceAccess.execute(session);
            if (!accessSuccess) {
                console.warn(`[GetWalletByIdUseCase] Falha de acesso ao espaço para partyId=${session.partyId}, contextId=${session.contextId}:`, error);
                return failure(error!);
            }

            const { canViewBalances } = accessData;
            if (!canViewBalances) {
                console.warn(`[GetWalletByIdUseCase] Permissão canViewBalances negada para partyId=${session.partyId}, contextId=${session.contextId}`);
                return failure("Sem permissão para visualizar as carteiras deste contexto!");
            }

            const wallet = await this.walletQueries.findWalletById(walletId, session.contextId);
            if (!wallet) {
                return failure("Carteira não encontrada.");
            }

            return success(wallet);
        } catch (error) {
            console.error("[GetWalletByIdUseCase] Falha crítica:", error);
            return failure("Ocorreu um erro interno. Tente novamente mais tarde.");
        }
    }
}
