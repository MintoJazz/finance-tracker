import { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import { failure, Result, success } from "@/types/result.types";
import { addMonths, endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import { CycleRange } from "@/modules/cycles/models/contract-cycle.schema";
import { CycleEngineService } from "@/modules/cycles/application/services/cycle-engine.service";
import { CycleWindow } from "@/modules/cycles/application/interfaces/commitment-cycle-engine.interface";
import { IContractCycleProfileQueries } from "@/modules/cycles/application/interfaces/contract-cycle-profile-queries.interface";
import { IPlanningAccessProvider } from "@/modules/space/application/interfaces/planning-access-provider.interface";

export interface ResolveCurrentContractCycleUseCaseDTO {
    session: SessionPayload;
    contextId?: number;
    contractId: number;
    referenceDate?: Date;
}

export class ResolveCurrentContractCycleUseCase {
    constructor(
        private readonly queries: IContractCycleProfileQueries,
        private readonly accessProvider: IPlanningAccessProvider,
        private readonly cycleEngine: CycleEngineService
    ) {}

    async execute(
        dto: ResolveCurrentContractCycleUseCaseDTO
    ): Promise<Result<CycleRange>> {
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

            // 2. Determinar janela temporal (6 meses antes e depois de now)
            const now = dto.referenceDate ? new Date(dto.referenceDate) : new Date();
            const todayStr = format(now, "yyyy-MM-dd");

            const window: CycleWindow = {
                from: startOfMonth(subMonths(now, 6)),
                to: endOfMonth(addMonths(now, 6)),
            };

            // 3. Buscar dados brutos e regras do contrato
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

            if (engineCycles.length === 0) {
                // Fallback para o mês corrente
                return success({
                    from: format(startOfMonth(now), "yyyy-MM-dd"),
                    to: format(endOfMonth(now), "yyyy-MM-dd"),
                });
            }

            // 5. Prioridade 1: ciclo que engloba a data de hoje (today)
            const cycleContainingToday = engineCycles.find(
                (c) => c.from <= todayStr && todayStr <= c.to
            );

            if (cycleContainingToday) {
                return success({
                    from: cycleContainingToday.from,
                    to: cycleContainingToday.to,
                });
            }

            // Prioridade 2: primeiro ciclo em aberto / pendente / atrasado mais próximo
            const activeCycle = engineCycles.find(
                (c) =>
                    c.status === "OPEN" ||
                    c.status === "PENDING" ||
                    c.status === "OVERDUE" ||
                    c.status === "PARTIAL"
            );

            if (activeCycle) {
                return success({
                    from: activeCycle.from,
                    to: activeCycle.to,
                });
            }

            // Prioridade 3: ciclo passado mais recente
            const lastPastCycle = [...engineCycles].findLast(
                (c) => c.to <= todayStr
            );

            if (lastPastCycle) {
                return success({
                    from: lastPastCycle.from,
                    to: lastPastCycle.to,
                });
            }

            return success({
                from: engineCycles[0].from,
                to: engineCycles[0].to,
            });
        } catch (error) {
            console.error("[ResolveCurrentContractCycleUseCase] Falha crítica:", error);
            return failure(
                "Ocorreu um erro interno ao resolver o ciclo atual do contrato."
            );
        }
    }
}
