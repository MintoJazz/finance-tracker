import { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import { failure, Result, success } from "@/types/result.types";
import { addMonths, endOfMonth, startOfMonth, subMonths } from "date-fns";
import { ContractProfile } from "@/modules/contracts/models/contract-profile.schema";
import { CycleEngineService } from "@/modules/cycles/application/services/cycle-engine.service";
import { CycleWindow } from "@/modules/cycles/application/interfaces/commitment-cycle-engine.interface";
import { IContractProfileQueries } from "@/modules/contracts/application/interfaces/contract-profile-queries.interface";
import { IPlanningAccessProvider } from "@/modules/space/application/interfaces/planning-access-provider.interface";
import { ContractProfileMapper } from "@/modules/contracts/infra/mappers/contract-profile.mapper";

export interface GetContractProfileUseCaseDTO {
    session: SessionPayload;
    contextId?: number;
    contractId: number;
    referenceDate?: Date;
}

export class GetContractProfileUseCase {
    constructor(
        private readonly queries: IContractProfileQueries,
        private readonly accessProvider: IPlanningAccessProvider,
        private readonly cycleEngine: CycleEngineService
    ) {}

    async execute(
        dto: GetContractProfileUseCaseDTO
    ): Promise<Result<ContractProfile>> {
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

            // 2. Determinar janela de projeção para o cálculo do resumo (12 meses para trás, 12 meses para frente)
            const now = dto.referenceDate ? new Date(dto.referenceDate) : new Date();
            const window: CycleWindow = {
                from: startOfMonth(subMonths(now, 12)),
                to: endOfMonth(addMonths(now, 12)),
            };

            // 3. Buscar dados brutos e fonte de ciclos na persistência
            const rawData = await this.queries.findContractProfileData(
                contextId,
                { agreementId: dto.contractId },
                window
            );

            if (!rawData) {
                return failure("Contrato não encontrado.");
            }

            // 4. Mapear persistência para o modelo de domínio
            const domainContract = ContractProfileMapper.toDomain(rawData.agreement, now);

            // 5. Projetar ciclos na janela com o motor puro
            const engineCycles = this.cycleEngine.projectCycles(
                [rawData.cycleSource],
                window,
                now
            );

            // 6. Converter ciclos do motor em ContractCycleItem[]
            const contractCycles = ContractProfileMapper.toCycleItems(
                engineCycles,
                domainContract.id
            );

            // 7. Calcular o resumo de métricas do perfil
            const summary = ContractProfileMapper.calculateProfileSummary(
                contractCycles,
                now
            );

            // 8. Montar e retornar o payload do ContractProfile
            const profile = ContractProfileMapper.toProfilePayload(
                domainContract,
                summary
            );

            return success(profile);
        } catch (error) {
            console.error("[GetContractProfileUseCase] Falha crítica:", error);
            return failure("Ocorreu um erro interno ao carregar o perfil do contrato.");
        }
    }
}
