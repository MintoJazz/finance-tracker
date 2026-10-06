import { IWalletQueries } from "../types/wallet-queries.interface";
import { ISpaceAccessProvider } from "../types/space-access-provider.interface";
import { SessionPayload } from "@/modules/identity/infra/cryptography/jwt-utils";
import { failure, success } from "@/types/result.types";

export interface GetWalletProfileUseCaseDTO {
    session: SessionPayload;
    walletId: number;
}

export class GetWalletProfileUseCase {
    constructor(
        private readonly walletQueries: IWalletQueries,
        private readonly getSpaceAccess: ISpaceAccessProvider
    ) {}

    async execute({ session, walletId }: GetWalletProfileUseCaseDTO) {
        try {
            const { success: accessSuccess, data: accessData, error } = await this.getSpaceAccess.execute(session);
            if (!accessSuccess) {
                console.warn(
                    `[GetWalletProfileUseCase] Falha de acesso ao espaço para partyId=${session.partyId}, contextId=${session.contextId}:`,
                    error
                );
                return failure(error!);
            }

            const { canViewBalances } = accessData;
            if (!canViewBalances) {
                console.warn(
                    `[GetWalletProfileUseCase] Permissão canViewBalances negada para partyId=${session.partyId}, contextId=${session.contextId}`
                );
                return failure("Sem permissão para visualizar as carteiras deste contexto!");
            }

            const profile = await this.walletQueries.findWalletProfileById(walletId, session.contextId);
            if (!profile) {
                return failure("Carteira não encontrada.");
            }

            return success(profile);
        } catch (error) {
            console.error("[GetWalletProfileUseCase] Falha crítica:", error);
            return failure("Ocorreu um erro interno. Tente novamente mais tarde.");
        }
    }
}