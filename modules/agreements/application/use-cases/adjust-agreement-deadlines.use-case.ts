import type { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import type { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import type { EffectiveFromValues } from "@/modules/agreements/models/effective-from.schema";
import { failure, success, type Result } from "@/types/result.types";
import type { IAgreementAdjustmentRepository } from "../interfaces/agreement-adjustment-repository.interface";
import {
    AgreementAdjustmentDomainError,
    AgreementAdjustmentPolicy,
    type AdjustmentScope,
    type DeadlinesInput,
} from "../policies/agreement-adjustment.policy";
import { civilToUtcDate } from "../services/civil-date";
import { resolveEffectiveDate } from "../services/effective-date.resolver";
import { SCOPE_BALANCE_TYPES } from "./adjust-agreement-amount.use-case";

export interface AdjustAgreementDeadlinesUseCaseDTO {
    session: SessionPayload;
    scope: AdjustmentScope;
    balanceId: number;
    data: EffectiveFromValues & DeadlinesInput;
}

export interface AdjustAgreementDeadlinesResult {
    id: number;
    name: string;
    /** Dia civil (YYYY-MM-DD) em que a nova regra passa a valer */
    effectiveFrom: string;
}

export class AdjustAgreementDeadlinesUseCase {
    constructor(
        private readonly repository: IAgreementAdjustmentRepository,
        private readonly getSpaceAccess: ISpaceAccessProvider,
        private readonly now: () => Date = () => new Date()
    ) {}

    async execute({
        session,
        scope,
        balanceId,
        data,
    }: AdjustAgreementDeadlinesUseCaseDTO): Promise<
        Result<AdjustAgreementDeadlinesResult>
    > {
        try {
            const { success: accessSuccess, data: accessData, error } =
                await this.getSpaceAccess.execute(session);
            if (!accessSuccess) {
                console.warn(
                    `[AdjustAgreementDeadlinesUseCase] Falha de acesso ao espaço para partyId=${session.partyId}, contextId=${session.contextId}:`,
                    error
                );
                return failure(error!);
            }
            if (!accessData.canManageBalances) {
                console.warn(
                    `[AdjustAgreementDeadlinesUseCase] Permissão canManageBalances negada para partyId=${session.partyId}, contextId=${session.contextId}`
                );
                return failure(AgreementAdjustmentPolicy.noPermissionMessage(scope));
            }

            const today = this.now();

            const result = await this.repository.withTransaction(async (repo) => {
                const agreement = await repo.findAgreementContext(
                    balanceId,
                    session.contextId,
                    SCOPE_BALANCE_TYPES[scope]
                );
                if (!agreement) {
                    throw new AgreementAdjustmentDomainError(
                        AgreementAdjustmentPolicy.notFoundMessage(scope),
                        "NOT_FOUND"
                    );
                }

                AgreementAdjustmentPolicy.assertAdjustable(scope, agreement, today);

                // Frequência vem do acordo, nunca do payload
                const deadlines = AgreementAdjustmentPolicy.normalizeDeadlines(
                    scope,
                    agreement.frequency,
                    data
                );

                const effectiveFrom = resolveEffectiveDate({
                    mode: data.effectiveMode,
                    effectiveFrom: data.effectiveFrom,
                    today,
                    agreement,
                    rules: agreement.rules,
                });

                const rule = await repo.upsertCycleRule({
                    agreementId: agreement.balanceId,
                    effectiveFrom: civilToUtcDate(effectiveFrom),
                    ...deadlines,
                });

                return { id: agreement.balanceId, name: agreement.name, effectiveFrom, ruleId: rule.id };
            });

            return success({
                id: result.id,
                name: result.name,
                effectiveFrom: result.effectiveFrom,
            });
        } catch (err) {
            if (err instanceof AgreementAdjustmentDomainError) {
                return failure(err.message);
            }
            console.error("[AdjustAgreementDeadlinesUseCase] Falha crítica:", err);
            return failure("Ocorreu um erro interno. Tente novamente mais tarde.");
        }
    }
}
