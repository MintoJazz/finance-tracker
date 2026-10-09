import { IContractRepository } from "../types/contract-repository.interface";
import { ISpaceAccessProvider } from "@/modules/account/core/types/space-access-provider.interface";
import { SessionPayload } from "@/modules/identity/infra/cryptography/jwt-utils";
import { failure, success } from "@/types/result.types";

export interface ToggleContractProjectionUseCaseDTO {
    session: SessionPayload;
    id: number;
    includeInProjection: boolean;
}

export class ToggleContractProjectionUseCase {
    constructor(
        private readonly contractRepository: IContractRepository,
        private readonly getSpaceAccess: ISpaceAccessProvider
    ) {}

    async execute({ session, id, includeInProjection }: ToggleContractProjectionUseCaseDTO) {
        try {
            const { success: accessSuccess, data, error } = await this.getSpaceAccess.execute(session);
            if (!accessSuccess || !data) {
                return failure(error || "Access denied.");
            }

            const { canManageBalances } = data;
            if (!canManageBalances) {
                return failure("Sem permissão para alterar contratos neste contexto!");
            }

            await this.contractRepository.updateContractProjection(id, session.contextId, includeInProjection);
            return success(null);
        } catch (error) {
            if (error instanceof Error && error.message === "ARCHIVED_CONTRACT") {
                console.error(`[ToggleContractProjectionUseCase] Tentativa de ativar contrato arquivado (id: ${id})`);
                return failure("Não é possível ativar um contrato arquivado.");
            }
            console.error("[ToggleContractProjectionUseCase] Critical failure:", error);
            return failure("Ocorreu um erro interno. Tente novamente mais tarde.");
        }
    }
}
