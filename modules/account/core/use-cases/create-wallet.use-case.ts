import { CreateWalletFormValues } from "../schemas/wallet.schema";
import { IWalletRepository } from "../types/wallet-repository.interface";
import { ISpaceAccessProvider } from "../types/space-access-provider.interface";
import { SessionPayload } from "@/modules/identity/infra/cryptography/jwt-utils";
import { failure, success } from "@/types/result.types";

export interface CreateWalletUseCaseDTO {
    session: SessionPayload;
    data: CreateWalletFormValues;
}

export class CreateWalletUseCase {
    constructor(
        private readonly walletRepository: IWalletRepository,
        private readonly getSpaceAccess: ISpaceAccessProvider
    ) { }

    async execute({ session, data }: CreateWalletUseCaseDTO) {
        try {
            const { success: accessSuccess, data: accessData, error } = await this.getSpaceAccess.execute(session);
            if (!accessSuccess) {
                console.warn(`[CreateWalletUseCase] Falha de acesso ao espaço para partyId=${session.partyId}, contextId=${session.contextId}:`, error);
                return failure(error!);
            }

            const { canManageBalances } = accessData;
            if (!canManageBalances) {
                console.warn(`[CreateWalletUseCase] Permissão canManageBalances negada para partyId=${session.partyId}, contextId=${session.contextId}`);
                return failure("Sem permissão para criar carteiras neste contexto!");
            }

            const createdWallet = await this.walletRepository.create({
                contextId: session.contextId,
                name: data.name,
            });

            return success(createdWallet);
        } catch (error) {
            console.error("[CreateWalletUseCase] Falha crítica:", error);
            return failure("Ocorreu um erro interno. Tente novamente mais tarde.");
        }
    }
}
