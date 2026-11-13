import { Page, PageRequest } from "@/types/pagination.types";
import { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import { failure, Result, success } from "@/types/result.types";
import {
    MovementEntry,
    MovementEntryFilters,
} from "@/modules/movements/models/movement-entry.schema";
import { IMovementQueries } from "@/modules/movements/application/interfaces/movement-queries.interface";
import { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import { IBalanceLookupProvider } from "@/modules/movements/application/interfaces/balance-lookup-provider.interface";

export interface GetContractCycleMovementsUseCaseDTO {
    session: SessionPayload;
    contractId: number;
    pageRequest: PageRequest;
    filter?: MovementEntryFilters;
}

export class GetContractCycleMovementsUseCase {
    constructor(
        private readonly movementQueries: IMovementQueries,
        private readonly spaceAccessProvider: ISpaceAccessProvider,
        private readonly balanceLookupProvider: IBalanceLookupProvider
    ) {}

    async execute({
        session,
        contractId,
        pageRequest,
        filter,
    }: GetContractCycleMovementsUseCaseDTO): Promise<Result<Page<MovementEntry>>> {
        try {
            const {
                success: accessSuccess,
                data: accessData,
                error,
            } = await this.spaceAccessProvider.execute(session);

            if (!accessSuccess || !accessData) {
                console.warn(
                    `[GetContractCycleMovementsUseCase] Falha de acesso ao espaço para partyId=${session.partyId}, contextId=${session.contextId}:`,
                    error
                );
                return failure(error ?? "Falha ao validar acesso ao contexto.");
            }

            if (!accessData.canViewBalances) {
                console.warn(
                    `[GetContractCycleMovementsUseCase] Permissão negada para partyId=${session.partyId}, contextId=${session.contextId}`
                );
                return failure(
                    "Sem permissão para visualizar as movimentações deste contrato!"
                );
            }

            const contract = this.balanceLookupProvider.findContractById
                ? await this.balanceLookupProvider.findContractById(
                      contractId,
                      session.contextId
                  )
                : null;

            if (!contract) {
                return failure("Contrato não encontrado.");
            }

            const entriesPage = await this.movementQueries.listBalanceMovementEntries(
                contractId,
                "CONTRACT_CYCLE",
                pageRequest,
                filter,
                { ignoreDateFilter: contract.isOnce }
            );

            return success(entriesPage);
        } catch (error) {
            console.error(
                "[GetContractCycleMovementsUseCase] Falha crítica:",
                error
            );
            return failure("Ocorreu um erro interno. Tente novamente mais tarde.");
        }
    }
}
