import { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import { failure, Result, success } from "@/types/result.types";
import { addMonths, endOfMonth, startOfMonth, subMonths } from "date-fns";
import {
    AgreementDetail,
    GetAgreementDetailInput,
} from "@/modules/contracts/models/agreement-detail.schema";
import { CycleEngineService } from "@/modules/cycles/application/services/cycle-engine.service";
import { IAgreementDetailQueries } from "@/modules/contracts/application/interfaces/agreement-detail-queries.interface";
import { CycleWindow } from "@/modules/cycles/application/interfaces/commitment-cycle-engine.interface";
import { IPlanningAccessProvider } from "@/modules/space/application/interfaces/planning-access-provider.interface";

export interface GetAgreementDetailUseCaseDTO {
    session: SessionPayload;
    contextId?: number;
    input: GetAgreementDetailInput;
    referenceDate?: Date;
}

function parseCivilDate(dateStr: string): Date {
    const parts = dateStr.split("-").map(Number);
    if (parts.length === 3 && !parts.some(Number.isNaN)) {
        return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    return new Date(dateStr);
}

export class GetAgreementDetailUseCase {
    constructor(
        private readonly queries: IAgreementDetailQueries,
        private readonly accessProvider: IPlanningAccessProvider,
        private readonly cycleEngine: CycleEngineService
    ) {}

    async execute(
        dto: GetAgreementDetailUseCaseDTO
    ): Promise<Result<AgreementDetail>> {
        try {
            const contextId = dto.contextId ?? dto.session.contextId;

            // 1. Validar permissões no espaço
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

            // 2. Determinar janela de projeção dos ciclos
            const now = dto.referenceDate ? new Date(dto.referenceDate) : new Date();
            let window: CycleWindow;
            if (dto.input.from && dto.input.to) {
                window = {
                    from: parseCivilDate(dto.input.from),
                    to: parseCivilDate(dto.input.to),
                };
            } else {
                window = {
                    from: startOfMonth(subMonths(now, 6)),
                    to: endOfMonth(addMonths(now, 6)),
                };
            }

            const identifier = {
                agreementId: dto.input.agreementId,
                balanceId: dto.input.balanceId,
            };

            // 3. Buscar detalhes cadastrais e fonte de ciclos em paralelo
            const [agreementData, cycleSource] = await Promise.all([
                this.queries.findAgreementDetail(contextId, identifier),
                this.queries.findAgreementCycleSource(contextId, identifier, window),
            ]);

            if (!agreementData) {
                return failure("Compromisso não encontrado.");
            }

            // 4. Calcular valor vigente na data atual (soma dos deltas com effectiveAt <= now)
            const currentExpectedValue = Math.max(
                0,
                agreementData.amountHistory
                    .filter((entry) => entry.effectiveAt <= now)
                    .reduce((acc, entry) => acc + entry.amount, 0)
            );

            // 5. Projetar ciclos usando o motor puro
            const cycles = cycleSource
                ? this.cycleEngine.projectCycles([cycleSource], window, now)
                : [];

            return success({
                id: agreementData.id,
                balanceId: agreementData.balanceId,
                name: agreementData.balanceName,
                balanceType: agreementData.balanceType,
                includeInProjection: agreementData.includeInProjection,
                startsAt: agreementData.startsAt,
                endsAt: agreementData.endsAt,
                isArchived: agreementData.isArchived,
                rule: agreementData.rule,
                currentExpectedValue,
                amountHistory: agreementData.amountHistory,
                cycles,
            });
        } catch (error) {
            console.error("[GetAgreementDetailUseCase] Falha crítica:", error);
            return failure("Ocorreu um erro interno. Tente novamente mais tarde.");
        }
    }
}
