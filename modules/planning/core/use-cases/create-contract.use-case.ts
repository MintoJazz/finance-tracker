import { IContractRepository, CreatedContractResult } from "../types/contract-repository.interface";
import { ISpaceAccessProvider } from "@/modules/account/core/types/space-access-provider.interface";
import { SessionPayload } from "@/modules/identity/infra/cryptography/jwt-utils";
import { ContractFormValues } from "../schemas/contract-form.schema";
import { Result, failure, success } from "@/types/result.types";

export interface CreateContractUseCaseDTO {
    session: SessionPayload;
    data: ContractFormValues;
}

export class CreateContractUseCase {
    constructor(
        private readonly contractRepository: IContractRepository,
        private readonly getSpaceAccess: ISpaceAccessProvider
    ) {}

    async execute({ session, data }: CreateContractUseCaseDTO): Promise<Result<CreatedContractResult>> {
        try {
            const { success: accessSuccess, data: accessData, error } =
                await this.getSpaceAccess.execute(session);

            if (!accessSuccess || !accessData) {
                return failure(error || "Acesso negado.");
            }

            if (!accessData.canManageBalances) {
                return failure("Sem permissão para criar contratos neste contexto!");
            }

            const created = await this.contractRepository.createContract({
                contextId: session.contextId,
                name: data.name,
                type: data.type,
                value: data.value,
                frequency: data.frequency,
                validity: data.validity,
                hasCustomClosingDay: data.hasCustomClosingDay,
                schedule: data.schedule,
                includeInProjection: data.includeInProjection,
            });

            return success(created);
        } catch (error) {
            console.error("[CreateContractUseCase] Falha crítica:", error);
            return failure("Ocorreu um erro interno ao criar o contrato.");
        }
    }
}
