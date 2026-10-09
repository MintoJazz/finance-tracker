import { SessionPayload } from "@/modules/identity/infra/cryptography/jwt-utils";
import { PageRequest } from "@/types/pagination.types";
import { failure, Result, success } from "@/types/result.types";
import { endOfMonth, format, startOfMonth } from "date-fns";
import {
    CommitmentCycleFilters,
    CommitmentCyclesResult,
} from "../schemas/commitment-cycle.schema";
import { CycleEngineService } from "../services/cycle-engine.service";
import { paginate } from "../services/paginate";
import { CycleWindow } from "../types/commitment-cycle-engine.interface";
import { ICommitmentCyclesQueries } from "../types/commitment-cycles-queries.interface";
import { IPlanningAccessProvider } from "../types/space-access-provider.interface";

export interface GetCommitmentCyclesUseCaseDTO {
    session: SessionPayload;
    contextId?: number;
    pageRequest: PageRequest;
    filter?: CommitmentCycleFilters;
}

/**
 * Converte string 'YYYY-MM-DD' em Date civil UTC 00:00:00
 */
function parseCivilDate(dateStr: string): Date {
    const parts = dateStr.split("-").map(Number);
    if (parts.length === 3 && !parts.some(Number.isNaN)) {
        return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    return new Date(dateStr);
}

export class GetCommitmentCyclesUseCase {
    constructor(
        private readonly queries: ICommitmentCyclesQueries,
        private readonly access: IPlanningAccessProvider,
        private readonly engine: CycleEngineService
    ) {}

    async execute(
        input: GetCommitmentCyclesUseCaseDTO,
        now: Date
    ): Promise<Result<CommitmentCyclesResult>> {
        try {
            // 1. Verificação de permissão de acesso
            const accessResult = await this.access.execute(input.session);
            if (!accessResult.success) {
                console.warn(
                    `[GetCommitmentCyclesUseCase] Falha de acesso ao espaço para partyId=${input.session.partyId}, contextId=${input.session.contextId}:`,
                    accessResult.error
                );
                return failure(accessResult.error);
            }

            const { canViewPlanning } = accessResult.data;
            if (!canViewPlanning) {
                console.warn(
                    `[GetCommitmentCyclesUseCase] Permissão canViewPlanning negada para partyId=${input.session.partyId}, contextId=${input.session.contextId}`
                );
                return failure("Sem permissão para visualizar o planejamento financeiro!");
            }

            // 2. Janela obrigatória: se filter.from/to ausentes, default = mês corrente a partir de 'now'
            let window: CycleWindow;
            if (input.filter?.from && input.filter?.to) {
                window = {
                    from: parseCivilDate(input.filter.from),
                    to: parseCivilDate(input.filter.to),
                };
            } else {
                const startMonth = startOfMonth(now);
                const endMonth = endOfMonth(now);
                window = {
                    from: parseCivilDate(format(startMonth, "yyyy-MM-dd")),
                    to: parseCivilDate(format(endMonth, "yyyy-MM-dd")),
                };
            }

            const contextId = input.contextId ?? input.session.contextId;

            // 3. Buscar fontes brutas de ciclo
            const sources = await this.queries.findCycleSources(contextId, window);

            // 4. Projetar ciclos na janela
            const inWindow = this.engine.projectCycles(sources, window, now);

            // 5. Calcular resumo global da janela (ignora q / statuses / balanceTypes)
            const summary = this.engine.summarizeCycles(inWindow);

            // 6. Aplicar filtros adicionais
            const filtered = this.engine.applyFilters(inWindow, input.filter);

            // 7. Paginar e retornar consolidado
            const paginatedCycles = paginate(filtered, input.pageRequest);

            return success({
                summary,
                cycles: paginatedCycles,
            });
        } catch (error) {
            console.error("[GetCommitmentCyclesUseCase] Falha crítica:", error);
            return failure("Ocorreu um erro interno. Tente novamente mais tarde.");
        }
    }
}
