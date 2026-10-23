import { SessionPayload } from "@/modules/identity/infra/cryptography/jwt-utils";
import { Page, PageRequest } from "@/types/pagination.types";
import { failure, Result, success } from "@/types/result.types";
import {
    addMonths,
    endOfMonth,
    endOfYear,
    startOfMonth,
    startOfYear,
    subMonths,
} from "date-fns";
import {
    ContractCycleFilters,
    ContractCycleItem,
} from "../schemas/contract-cycle.schema";
import { CycleEngineService } from "../services/cycle-engine.service";
import { CycleWindow } from "../types/commitment-cycle-engine.interface";
import { IContractProfileQueries } from "../types/contract-profile-queries.interface";
import { IPlanningAccessProvider } from "../types/space-access-provider.interface";
import { ContractProfileMapper } from "../../infra/mappers/contract-profile.mapper";

export interface GetContractCyclesUseCaseDTO {
    session: SessionPayload;
    contextId?: number;
    contractId: number;
    pageRequest?: PageRequest;
    filter?: ContractCycleFilters;
    referenceDate?: Date;
}

function parseCivilDate(dateStr: string): Date {
    const parts = dateStr.split("-").map(Number);
    if (parts.length === 3 && !parts.some(Number.isNaN)) {
        return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    return new Date(dateStr);
}

export class GetContractCyclesUseCase {
    constructor(
        private readonly queries: IContractProfileQueries,
        private readonly accessProvider: IPlanningAccessProvider,
        private readonly cycleEngine: CycleEngineService
    ) {}

    async execute(
        dto: GetContractCyclesUseCaseDTO
    ): Promise<Result<Page<ContractCycleItem>>> {
        try {
            const contextId = dto.contextId ?? dto.session.contextId;

            // 1. Validar permissões no contexto
            const {
                success: accessSuccess,
                data: accessData,
                error,
            } = await this.accessProvider.execute(dto.session);

            if (!accessSuccess || !accessData) {
                return failure(error ?? "Falha ao validar acesso ao contexto.");
            }

            if (!accessData.canViewPlanning) {
                return failure(
                    "Sem permissão para visualizar compromissos deste contexto!"
                );
            }

            // 2. Determinar janela de busca
            const now = dto.referenceDate ? new Date(dto.referenceDate) : new Date();
            let window: CycleWindow;

            if (dto.filter?.from && dto.filter?.to) {
                window = {
                    from: parseCivilDate(dto.filter.from),
                    to: parseCivilDate(dto.filter.to),
                };
            } else if (dto.filter?.year) {
                window = {
                    from: startOfYear(new Date(dto.filter.year, 0, 1)),
                    to: endOfYear(new Date(dto.filter.year, 11, 31)),
                };
            } else {
                window = {
                    from: startOfMonth(subMonths(now, 12)),
                    to: endOfMonth(addMonths(now, 12)),
                };
            }

            // 3. Buscar dados brutos e fonte de ciclos
            const rawData = await this.queries.findContractProfileData(
                contextId,
                { agreementId: dto.contractId },
                window
            );

            if (!rawData) {
                return failure("Contrato não encontrado.");
            }

            // 4. Projetar ciclos usando o motor puro
            const engineCycles = this.cycleEngine.projectCycles(
                [rawData.cycleSource],
                window,
                now
            );

            // 5. Converter ciclos do motor em ContractCycleItem[]
            const contractCycles = ContractProfileMapper.toCycleItems(
                engineCycles,
                rawData.agreement.id
            );

            // 6. Aplicar filtros e paginação
            const pageRequest = dto.pageRequest ?? { page: 1, pageSize: 10 };
            const paginated = ContractProfileMapper.filterAndPaginateCycles(
                contractCycles,
                dto.filter,
                pageRequest
            );

            return success(paginated);
        } catch (error) {
            console.error("[GetContractCyclesUseCase] Falha crítica:", error);
            return failure("Ocorreu um erro interno ao carregar os ciclos do contrato.");
        }
    }
}
