import { IContractRepository } from "../types/contract-repository.interface";
import { ISpaceAccessProvider } from "@/modules/account/core/types/space-access-provider.interface";
import { SessionPayload } from "@/modules/identity/infra/cryptography/jwt-utils";
import { failure, success } from "@/types/result.types";

export interface RestoreContractUseCaseDTO {
    session: SessionPayload;
    id: number;
}

export class RestoreContractUseCase {
    constructor(
        private readonly contractRepository: IContractRepository,
        private readonly getSpaceAccess: ISpaceAccessProvider
    ) {}

    async execute({ session, id }: RestoreContractUseCaseDTO) {
        try {
            const { success: accessSuccess, data, error } = await this.getSpaceAccess.execute(session);
            if (!accessSuccess || !data) {
                return failure(error || "Access denied.");
            }

            const { canManageBalances } = data;
            if (!canManageBalances) {
                return failure("Sem permissão para restaurar contratos neste contexto!");
            }

            await this.contractRepository.restoreContract(id, session.contextId);
            return success(null);
        } catch (error) {
            console.error("[RestoreContractUseCase] Critical failure:", error);
            return failure("Ocorreu um erro interno. Tente novamente mais tarde.");
        }
    }
}
