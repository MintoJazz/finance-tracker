import { UpdateWalletInput } from "../../models/wallet.schema";
import { IWalletRepository } from "../interfaces/wallet-repository.interface";
import { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import { failure, success } from "@/types/result.types";

export interface UpdateWalletUseCaseDTO {
    session: SessionPayload;
    data: UpdateWalletInput;
}

export class UpdateWalletUseCase {
    constructor(
        private readonly walletRepository: IWalletRepository,
        private readonly getSpaceAccess: ISpaceAccessProvider
    ) { }

    async execute({ session, data }: UpdateWalletUseCaseDTO) {
        try {
            const { success: accessSuccess, data: accessData, error } = await this.getSpaceAccess.execute(session);
            if (!accessSuccess) {
                console.warn(`[UpdateWalletUseCase] Falha de acesso ao espaço para partyId=${session.partyId}, contextId=${session.contextId}:`, error);
                return failure(error!);
            }

            const { canManageBalances } = accessData;
            if (!canManageBalances) {
                console.warn(`[UpdateWalletUseCase] Permissão canManageBalances negada para partyId=${session.partyId}, contextId=${session.contextId}`);
                return failure("Sem permissão para gerenciar as carteiras deste contexto!");
            }

            const existingWallet = await this.walletRepository.findByIdAndContextId(data.id, session.contextId);
            if (!existingWallet) {
                return failure("Carteira não encontrada.");
            }

            if (existingWallet.isArchived) {
                return failure("Não é possível editar uma carteira arquivada.");
            }

            const updatedWallet = await this.walletRepository.update(data.id, session.contextId, {
                name: data.name,
            });

            return success(updatedWallet);
        } catch (error) {
            console.error("[UpdateWalletUseCase] Falha crítica:", error);
            return failure("Ocorreu um erro interno. Tente novamente mais tarde.");
        }
    }
}
