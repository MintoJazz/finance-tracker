import type { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import type { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import type { EffectiveFromValues } from "@/modules/agreements/models/effective-from.schema";
import { failure, success, type Result } from "@/types/result.types";
import type {
    AdjustableBalanceType,
    IAgreementAdjustmentRepository,
} from "../interfaces/agreement-adjustment-repository.interface";
import {
    AgreementAdjustmentDomainError,
    AgreementAdjustmentPolicy,
    type AdjustmentScope,
} from "../policies/agreement-adjustment.policy";
import { hasEntriesAfter, toAmountDelta } from "../services/agreement-ledger";
import { civilToLocalNoon, toCivilString } from "../services/civil-date";
import { resolveEffectiveDate } from "../services/effective-date.resolver";

export const SCOPE_BALANCE_TYPES: Record<AdjustmentScope, AdjustableBalanceType[]> = {
    CARD: ["CREDIT"],
    RECURRENCE: ["PAYABLE", "RECEIVABLE"],
};

const DEFAULT_REASON: Record<AdjustmentScope, string> = {
    CARD: "Ajuste de limite",
    RECURRENCE: "Ajuste de valor",
};

export interface AdjustAgreementAmountUseCaseDTO {
    session: SessionPayload;
    scope: AdjustmentScope;
    balanceId: number;
    data: EffectiveFromValues & {
        /** Novo valor/limite ABSOLUTO, em centavos */
        amount: number;
        reason?: string | null;
    };
}

export interface AdjustAgreementAmountResult {
    id: number;
    name: string;
    /** Dia civil (YYYY-MM-DD) em que o novo valor passa a valer */
    effectiveAt: string;
    amount: number;
    /** Variação gravada no livro de valores */
    delta: number;
}

export class AdjustAgreementAmountUseCase {
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
    }: AdjustAgreementAmountUseCaseDTO): Promise<Result<AdjustAgreementAmountResult>> {
        try {
            const { success: accessSuccess, data: accessData, error } =
                await this.getSpaceAccess.execute(session);
            if (!accessSuccess) {
                console.warn(
                    `[AdjustAgreementAmountUseCase] Falha de acesso ao espaço para partyId=${session.partyId}, contextId=${session.contextId}:`,
                    error
                );
                return failure(error!);
            }
            if (!accessData.canManageBalances) {
                console.warn(
                    `[AdjustAgreementAmountUseCase] Permissão canManageBalances negada para partyId=${session.partyId}, contextId=${session.contextId}`
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
                AgreementAdjustmentPolicy.assertValidAmount(data.amount);

                const effectiveDay = resolveEffectiveDate({
                    mode: data.effectiveMode,
                    effectiveFrom: data.effectiveFrom,
                    today,
                    agreement,
                    rules: agreement.rules,
                });

                // "Agora" grava o instante; datas futuras usam meio-dia local (não viram o dia)
                const effectiveAt =
                    effectiveDay === toCivilString(today)
                        ? today
                        : civilToLocalNoon(effectiveDay);

                // Linhas são deltas: uma linha agendada depois deslocaria o valor já combinado
                if (hasEntriesAfter(agreement.amountEntries, effectiveAt)) {
                    throw new AgreementAdjustmentDomainError(
                        "Já existe um ajuste agendado para depois dessa data.",
                        "LATER_ENTRY_EXISTS"
                    );
                }

                const delta = toAmountDelta(data.amount, agreement.amountEntries, effectiveAt);
                if (delta === 0) {
                    throw new AgreementAdjustmentDomainError(
                        "O valor informado é igual ao valor vigente nessa data.",
                        "NO_CHANGE"
                    );
                }

                await repo.addAmountEntry({
                    agreementId: agreement.balanceId,
                    delta,
                    effectiveAt,
                    reason: data.reason?.trim() || DEFAULT_REASON[scope],
                });

                return {
                    id: agreement.balanceId,
                    name: agreement.name,
                    effectiveAt: effectiveDay,
                    amount: data.amount,
                    delta,
                };
            });

            return success(result);
        } catch (err) {
            if (err instanceof AgreementAdjustmentDomainError) {
                return failure(err.message);
            }
            console.error("[AdjustAgreementAmountUseCase] Falha crítica:", err);
            return failure("Ocorreu um erro interno. Tente novamente mais tarde.");
        }
    }
}
