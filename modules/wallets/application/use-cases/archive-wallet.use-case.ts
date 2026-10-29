import { ArchiveWalletInput } from "../../models/wallet.schema";
import { IWalletRepository } from "../interfaces/wallet-repository.interface";
import { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import { failure, success } from "@/types/result.types";

export interface ArchiveWalletUseCaseDTO {
    session: SessionPayload;
    data: ArchiveWalletInput;
}

export class ArchiveWalletUseCase {
    constructor(
        private readonly walletRepository: IWalletRepository,
        private readonly getSpaceAccess: ISpaceAccessProvider
    ) { }

    async execute({ session, data }: ArchiveWalletUseCaseDTO) {
        try {
            const { success: accessSuccess, data: accessData, error } = await this.getSpaceAccess.execute(session);
            if (!accessSuccess) {
                console.warn(`[ArchiveWalletUseCase] Falha de acesso ao espaço para partyId=${session.partyId}, contextId=${session.contextId}:`, error);
                return failure(error!);
            }

            const { canManageBalances } = accessData;
            if (!canManageBalances) {
                console.warn(`[ArchiveWalletUseCase] Permissão canManageBalances negada para partyId=${session.partyId}, contextId=${session.contextId}`);
                return failure("Sem permissão para gerenciar as carteiras deste contexto!");
            }

            const existingWallet = await this.walletRepository.findByIdAndContextId(data.id, session.contextId);
            if (!existingWallet) {
                return failure("Carteira não encontrada.");
            }

            if (existingWallet.isArchived) {
                return failure("Esta carteira já está arquivada.");
            }

            const archivedWallet = await this.walletRepository.archive(data.id, session.contextId);

            return success(archivedWallet);
        } catch (error) {
            console.error("[ArchiveWalletUseCase] Falha crítica:", error);
            return failure("Ocorreu um erro interno. Tente novamente mais tarde.");
        }
    }
}
