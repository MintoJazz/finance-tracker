import { IContractRepository } from "@/modules/contracts/application/interfaces/contract-repository.interface";
import { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import { failure, success } from "@/types/result.types";

export interface ArchiveContractUseCaseDTO {
    session: SessionPayload;
    id: number;
}

export class ArchiveContractUseCase {
    constructor(
        private readonly contractRepository: IContractRepository,
        private readonly getSpaceAccess: ISpaceAccessProvider
    ) {}

    async execute({ session, id }: ArchiveContractUseCaseDTO) {
        try {
            const { success: accessSuccess, data, error } = await this.getSpaceAccess.execute(session);
            if (!accessSuccess || !data) {
                return failure(error || "Access denied.");
            }

            const { canManageBalances } = data;
            if (!canManageBalances) {
                return failure("Sem permissão para arquivar contratos neste contexto!");
            }

            await this.contractRepository.archiveContract(id, session.contextId);
            return success(null);
        } catch (error) {
            console.error("[ArchiveContractUseCase] Critical failure:", error);
            return failure("Ocorreu um erro interno. Tente novamente mais tarde.");
        }
    }
}
