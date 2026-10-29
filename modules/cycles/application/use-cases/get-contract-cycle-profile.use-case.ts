import { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import { failure, Result, success } from "@/types/result.types";
import { addMonths, endOfMonth, isAfter, isBefore, startOfMonth, subMonths } from "date-fns";
import { CommitmentCycleItem } from "@/modules/cycles/models/commitment-cycle.schema";
import {
    ContractCycleProfile,
    CycleEntryRow,
    CycleRange,
} from "@/modules/cycles/models/contract-cycle.schema";
import { CycleEngineService } from "@/modules/cycles/application/services/cycle-engine.service";
import { CycleWindow } from "@/modules/cycles/application/interfaces/commitment-cycle-engine.interface";
import { IContractCycleProfileQueries } from "@/modules/cycles/application/interfaces/contract-cycle-profile-queries.interface";
import { RawContractAgreement } from "@/modules/contracts/application/interfaces/contract-profile-queries.interface";
import { IPlanningAccessProvider } from "@/modules/space/application/interfaces/planning-access-provider.interface";
import { ContractCycleProfileMapper } from "@/modules/cycles/infra/mappers/contract-cycle-profile.mapper";

export interface GetContractCycleProfileUseCaseDTO {
    session: SessionPayload;
    contextId?: number;
    contractId: number;
    range: CycleRange;
    referenceDate?: Date;
}

export interface ContractCycleProfileData {
    cycle: ContractCycleProfile;
    entries: CycleEntryRow[];
}

function parseCivilDate(dateStr: string): Date {
    const parts = dateStr.split("-").map(Number);
    if (parts.length === 3 && !parts.some(Number.isNaN)) {
        return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    return new Date(dateStr);
}

export class GetContractCycleProfileUseCase {
    constructor(
        private readonly queries: IContractCycleProfileQueries,
        private readonly accessProvider: IPlanningAccessProvider,
        private readonly cycleEngine: CycleEngineService
    ) {}

    async execute(
        dto: GetContractCycleProfileUseCaseDTO
    ): Promise<Result<ContractCycleProfileData>> {
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

            // 2. Determinar janela temporal e datas de referência
            const now = dto.referenceDate ? new Date(dto.referenceDate) : new Date();
            const targetFrom = parseCivilDate(dto.range.from);
            const targetTo = parseCivilDate(dto.range.to);

            const earliestDate = isBefore(targetFrom, now) ? targetFrom : now;
            const latestDate = isAfter(targetTo, now) ? targetTo : now;
            const window: CycleWindow = {
                from: startOfMonth(subMonths(earliestDate, 6)),
                to: endOfMonth(addMonths(latestDate, 6)),
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

            // 5. Localizar o ciclo alvo e ciclos adjacentes (prev / next)
            const { targetCycle, prevRange, nextRange } =
                this.resolveTargetAndSiblings(
                    engineCycles,
                    dto.range,
                    rawData.agreement,
                    targetTo
                );

            // 6. Buscar lançamentos do ciclo
            const rawEntries = await this.queries.findCycleEntries(
                contextId,
                rawData.agreement.balanceId,
                targetFrom,
                targetTo
            );

            // 7. Mapear lançamentos e perfil do ciclo para o domínio
            const entries = ContractCycleProfileMapper.toCycleEntryRows(
                rawEntries,
                rawData.agreement.balanceId,
                dto.range
            );

            const cycle = ContractCycleProfileMapper.toContractCycleProfile({
                agreement: rawData.agreement,
                targetCycle,
                prevRange,
                nextRange,
                entries,
            });

            return success({
                cycle,
                entries,
            });
        } catch (error) {
            console.error("[GetContractCycleProfileUseCase] Falha crítica:", error);
            return failure(
                "Ocorreu um erro interno ao carregar o perfil do ciclo do contrato."
            );
        }
    }

    private resolveTargetAndSiblings(
        engineCycles: CommitmentCycleItem[],
        range: CycleRange,
        rawAgreement: RawContractAgreement,
        targetTo: Date
    ): {
        targetCycle: CommitmentCycleItem;
        prevRange: CycleRange | null;
        nextRange: CycleRange | null;
    } {
        const targetIndex = engineCycles.findIndex(
            (c) => c.from === range.from && c.to === range.to
        );

        if (targetIndex !== -1) {
            const prevCycle = targetIndex > 0 ? engineCycles[targetIndex - 1] : null;
            const nextCycle =
                targetIndex < engineCycles.length - 1
                    ? engineCycles[targetIndex + 1]
                    : null;

            return {
                targetCycle: engineCycles[targetIndex],
                prevRange: prevCycle ? { from: prevCycle.from, to: prevCycle.to } : null,
                nextRange: nextCycle ? { from: nextCycle.from, to: nextCycle.to } : null,
            };
        }

        const sorted = [...engineCycles].sort(
            (a, b) =>
                parseCivilDate(a.from).getTime() - parseCivilDate(b.from).getTime()
        );
        const prevCycle = sorted.findLast((c) => c.to <= range.from) ?? null;
        const nextCycle = sorted.find((c) => c.from >= range.to) ?? null;

        const fallbackTarget: CommitmentCycleItem = {
            balanceId: rawAgreement.balance.id,
            balanceName: rawAgreement.balance.name,
            balanceType: "COMMITMENT",
            label: range.from,
            from: range.from,
            to: range.to,
            dueDate: targetTo,
            totalAmount: 0,
            paidAmount: 0,
            remainingAmount: 0,
            status: "OPEN",
        };

        return {
            targetCycle: fallbackTarget,
            prevRange: prevCycle ? { from: prevCycle.from, to: prevCycle.to } : null,
            nextRange: nextCycle ? { from: nextCycle.from, to: nextCycle.to } : null,
        };
    }
}
