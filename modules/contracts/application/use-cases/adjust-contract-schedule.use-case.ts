import { IContractRepository } from "@/modules/contracts/application/interfaces/contract-repository.interface";
import { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import { failure, Result, success } from "@/types/result.types";
import { AdjustContractScheduleFormValues } from "@/modules/contracts/models/adjust-contract-schedule-form.schema";
import { CycleEngineService } from "@/modules/cycles/application/services/cycle-engine.service";
import { AgreementCycleSourceData, CycleWindow } from "@/modules/cycles/application/interfaces/commitment-cycle-engine.interface";
import { addMonths, endOfMonth, isAfter, startOfDay, startOfMonth, subMonths } from "date-fns";

export interface AdjustContractScheduleUseCaseDTO {
    session: SessionPayload;
    contractId: number;
    data: AdjustContractScheduleFormValues;
    now?: Date;
}

function parseCivilDate(dateStr: string): Date {
    const parts = dateStr.split("-").map(Number);
    if (parts.length === 3 && !parts.some(Number.isNaN)) {
        return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    return new Date(dateStr);
}

export class AdjustContractScheduleUseCase {
    constructor(
        private readonly contractRepository: IContractRepository,
        private readonly getSpaceAccess: ISpaceAccessProvider,
        private readonly cycleEngine: CycleEngineService
    ) {}

    async execute({ session, contractId, data, now }: AdjustContractScheduleUseCaseDTO): Promise<Result<void>> {
        try {
            const { success: accessSuccess, data: accessData, error } =
                await this.getSpaceAccess.execute(session);

            if (!accessSuccess || !accessData) {
                return failure(error || "Acesso negado.");
            }

            if (!accessData.canManageBalances) {
                return failure("Sem permissão para ajustar contratos neste contexto!");
            }

            const contract = await this.contractRepository.findContractForAdjustment(contractId, session.contextId);
            if (!contract) {
                return failure("Contrato não encontrado ou acesso negado.");
            }

            const referenceNow = now ? new Date(now) : new Date();
            let targetEffectiveFrom: Date;

            if (data.effectiveScope === "IMMEDIATE") {
                targetEffectiveFrom = startOfDay(referenceNow);
            } else if (data.effectiveScope === "SPECIFIC_DATE") {
                if (!data.effectiveDate) {
                    return failure("Informe a data para início de vigência.");
                }
                targetEffectiveFrom = startOfDay(new Date(data.effectiveDate));
            } else {
                // NEXT_CYCLE: projetar ciclos e obter a data de início do próximo ciclo
                const window: CycleWindow = {
                    from: startOfMonth(subMonths(referenceNow, 1)),
                    to: endOfMonth(addMonths(referenceNow, 12)),
                };

                const cycleSource: AgreementCycleSourceData = {
                    agreementId: contract.id,
                    balanceId: contract.balanceId,
                    balanceName: contract.name,
                    balanceType: contract.balanceType,
                    includeInProjection: contract.includeInProjection,
                    startsAt: contract.startsAt,
                    endsAt: contract.endsAt,
                    amountLog: contract.amountEntries.map((e) => ({
                        amount: e.amount,
                        effectiveAt: e.effectiveAt,
                    })),
                    rules: contract.rules.map((r) => ({
                        ...r,
                        agreementId: contract.id,
                        entries: [],
                    })),
                };

                const projectedCycles = this.cycleEngine.projectCycles([cycleSource], window, referenceNow);
                const todayCivil = startOfDay(referenceNow);

                const nextCycle =
                    projectedCycles.find((c) => isAfter(startOfDay(parseCivilDate(c.from)), todayCivil)) ??
                    projectedCycles.find((c) => isAfter(startOfDay(c.dueDate), todayCivil));

                if (nextCycle) {
                    targetEffectiveFrom = startOfDay(parseCivilDate(nextCycle.from));
                } else {
                    targetEffectiveFrom = startOfMonth(addMonths(referenceNow, 1));
                }
            }

            const frequency = data.frequency ?? "MONTHLY";
            const closingDay = data.hasCustomClosingDay ? data.schedule.closingDay ?? null : null;

            if (frequency === "YEARLY" && data.schedule.dueMonth) {
                const year = targetEffectiveFrom.getFullYear();
                const month = data.schedule.dueMonth - 1;
                const day = Math.min(data.schedule.dueDay, 28);
                targetEffectiveFrom = new Date(year, month, day, 12, 0, 0);
            }

            await this.contractRepository.adjustContractSchedule(contractId, session.contextId, {
                effectiveFrom: targetEffectiveFrom,
                frequency,
                interval: 1,
                dueDay: data.schedule.dueDay,
                closingDay,
            });

            return success(undefined);
        } catch (error) {
            console.error("[AdjustContractScheduleUseCase] Falha crítica:", error);
            return failure("Ocorreu um erro interno ao ajustar os prazos do contrato.");
        }
    }
}
