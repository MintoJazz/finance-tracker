import { IContractRepository } from "@/modules/contracts/application/interfaces/contract-repository.interface";
import { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import { failure, Result, success } from "@/types/result.types";
import { AdjustContractLimitsFormValues } from "@/modules/contracts/models/adjust-contract-limits-form.schema";
import { CycleEngineService } from "@/modules/cycles/application/services/cycle-engine.service";
import { AgreementCycleSourceData, CycleWindow } from "@/modules/cycles/application/interfaces/commitment-cycle-engine.interface";
import { addMonths, endOfMonth, isAfter, startOfDay, startOfMonth, subMonths } from "date-fns";

export interface AdjustContractLimitsUseCaseDTO {
    session: SessionPayload;
    contractId: number;
    data: AdjustContractLimitsFormValues;
    now?: Date;
}

function parseCivilDate(dateStr: string): Date {
    const parts = dateStr.split("-").map(Number);
    if (parts.length === 3 && !parts.some(Number.isNaN)) {
        return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    return new Date(dateStr);
}

export class AdjustContractLimitsUseCase {
    constructor(
        private readonly contractRepository: IContractRepository,
        private readonly getSpaceAccess: ISpaceAccessProvider,
        private readonly cycleEngine: CycleEngineService
    ) {}

    async execute({ session, contractId, data, now }: AdjustContractLimitsUseCaseDTO): Promise<Result<void>> {
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
            let targetEffectiveAt: Date;

            if (data.effectiveScope === "IMMEDIATE") {
                targetEffectiveAt = startOfDay(referenceNow);
            } else if (data.effectiveScope === "SPECIFIC_DATE") {
                if (!data.effectiveDate) {
                    return failure("Informe a data para início de vigência.");
                }
                targetEffectiveAt = startOfDay(new Date(data.effectiveDate));
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

                // Próximo ciclo: primeiro ciclo cujo início (from) é posterior a hoje
                const nextCycle =
                    projectedCycles.find((c) => isAfter(startOfDay(parseCivilDate(c.from)), todayCivil)) ??
                    projectedCycles.find((c) => isAfter(startOfDay(c.dueDate), todayCivil));

                if (nextCycle) {
                    targetEffectiveAt = startOfDay(parseCivilDate(nextCycle.from));
                } else {
                    targetEffectiveAt = startOfMonth(addMonths(referenceNow, 1));
                }
            }

            // Calcular valor vigente atual na data de vigência alvo
            const targetCivil = startOfDay(targetEffectiveAt);
            const currentValue = contract.amountEntries
                .filter((e) => !isAfter(startOfDay(e.effectiveAt), targetCivil))
                .reduce((sum, e) => sum + e.amount, 0);

            const normalizedCurrentValue = Math.max(0, currentValue);
            const delta = data.value - normalizedCurrentValue;

            if (delta !== 0) {
                await this.contractRepository.adjustContractLimits(contractId, session.contextId, {
                    amount: delta,
                    effectiveAt: targetEffectiveAt,
                    reason: "Ajuste de limite",
                });
            }

            return success(undefined);
        } catch (error) {
            console.error("[AdjustContractLimitsUseCase] Falha crítica:", error);
            return failure("Ocorreu um erro interno ao ajustar os limites do contrato.");
        }
    }
}
