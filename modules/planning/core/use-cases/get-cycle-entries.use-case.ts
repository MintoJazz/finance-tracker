import { SessionPayload } from "@/modules/identity/infra/cryptography/jwt-utils";
import { Page, PageRequest } from "@/types/pagination.types";
import { failure, Result, success } from "@/types/result.types";
import {
    CycleEntryItem,
    GetCycleEntriesInput,
} from "../schemas/cycle-entries.schema";
import { ICycleEntriesQueries } from "../types/cycle-entries-queries.interface";
import { IPlanningAccessProvider } from "../types/space-access-provider.interface";

export interface GetCycleEntriesUseCaseDTO {
    session: SessionPayload;
    contextId?: number;
    input: GetCycleEntriesInput;
}

function parseCivilDate(dateStr: string): Date {
    const parts = dateStr.split("-").map(Number);
    if (parts.length === 3 && !parts.some(Number.isNaN)) {
        return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    return new Date(dateStr);
}

export class GetCycleEntriesUseCase {
    constructor(
        private readonly queries: ICycleEntriesQueries,
        private readonly accessProvider: IPlanningAccessProvider
    ) {}

    async execute(
        dto: GetCycleEntriesUseCaseDTO
    ): Promise<Result<Page<CycleEntryItem>>> {
        try {
            const contextId = dto.contextId ?? dto.session.contextId;

            // 1. Validar permissões de acesso ao planejamento
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
                    "Sem permissão para visualizar os lançamentos deste contexto!"
                );
            }

            // 2. Normalizar parâmetros e datas civis
            const from = parseCivilDate(dto.input.from);
            const to = parseCivilDate(dto.input.to);

            const pageRequest: PageRequest = {
                page: dto.input.page ?? 1,
                pageSize: dto.input.pageSize ?? 10,
            };

            const identifier = {
                agreementId: dto.input.agreementId,
                balanceId: dto.input.balanceId,
            };

            // 3. Consultar página de lançamentos do ciclo
            const resultPage = await this.queries.listCycleEntries({
                contextId,
                identifier,
                from,
                to,
                pageRequest,
                q: dto.input.q,
            });

            return success(resultPage);
        } catch (error) {
            console.error("[GetCycleEntriesUseCase] Falha crítica:", error);
            return failure("Ocorreu um erro interno. Tente novamente mais tarde.");
        }
    }
}
