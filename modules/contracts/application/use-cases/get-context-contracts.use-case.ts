import { PageRequest } from "@/types/pagination.types";
import { IContractQueries, ContractFilter } from "@/modules/contracts/application/interfaces/contract-queries.interface";
import { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import { failure, success } from "@/types/result.types";

export interface GetContextContractsUseCaseDTO {
    session: SessionPayload;
    pageRequest: PageRequest;
    filter?: ContractFilter;
}

export class GetContextContractsUseCase {
    constructor(
        private readonly contractQueries: IContractQueries,
        private readonly getSpaceAccess: ISpaceAccessProvider
    ) {}

    async execute({ session, pageRequest, filter }: GetContextContractsUseCaseDTO) {
        try {
            const { success: accessSuccess, data, error } = await this.getSpaceAccess.execute(session);
            if (!accessSuccess || !data) {
                console.warn(`[GetContextContractsUseCase] Access failure for partyId=${session.partyId}, contextId=${session.contextId}:`, error);
                return failure(error || "Access denied.");
            }

            const { canViewBalances } = data;
            if (!canViewBalances) {
                console.warn(`[GetContextContractsUseCase] Permission canViewBalances denied for partyId=${session.partyId}, contextId=${session.contextId}`);
                return failure("Sem permissão para visualizar os contratos deste contexto!");
            }

            return success(await this.contractQueries.listContractsByContextId(session.contextId, pageRequest, filter));
        } catch (error) {
            console.error("[GetContextContractsUseCase] Critical failure:", error);
            return failure("Ocorreu um erro interno. Tente novamente mais tarde.");
        }
    }
}
