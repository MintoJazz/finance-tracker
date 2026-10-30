import { IContractRepository } from "@/modules/contracts/application/interfaces/contract-repository.interface";
import { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import { failure, Result, success } from "@/types/result.types";

export interface RenameContractUseCaseDTO {
    session: SessionPayload;
    contractId: number;
    name: string;
}

export class RenameContractUseCase {
    constructor(
        private readonly contractRepository: IContractRepository,
        private readonly getSpaceAccess: ISpaceAccessProvider
    ) {}

    async execute({ session, contractId, name }: RenameContractUseCaseDTO): Promise<Result<void>> {
        try {
            const trimmedName = name?.trim();
            if (!trimmedName) {
                return failure("O nome do contrato não pode ser vazio.");
            }

            const { success: accessSuccess, data, error } = await this.getSpaceAccess.execute(session);
            if (!accessSuccess || !data) {
                return failure(error || "Acesso negado.");
            }

            if (!data.canManageBalances) {
                return failure("Sem permissão para editar contratos neste contexto!");
            }

            await this.contractRepository.renameContract(contractId, session.contextId, trimmedName);
            return success(undefined);
        } catch (error) {
            console.error("[RenameContractUseCase] Falha crítica:", error);
            return failure("Ocorreu um erro interno ao renomear o contrato.");
        }
    }
}

