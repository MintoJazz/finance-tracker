import type { CycleFrequency } from "@/prisma/generated/prisma/client";
import type { CycleRuleRecord } from "@/modules/cycles/application/services/cycle-engine.registry";
import type { LedgerEntry } from "../services/agreement-ledger";

export type AdjustableBalanceType = "CREDIT" | "PAYABLE" | "RECEIVABLE";

export interface AgreementAdjustmentContext {
    /** Id do Balance (= Agreement.balanceId) */
    balanceId: number;
    name: string;
    balanceType: AdjustableBalanceType;
    removedAt: Date | null;
    frequency: CycleFrequency;
    interval: number;
    startsAt: Date;
    endsAt: Date | null;
    rules: CycleRuleRecord[];
    amountEntries: LedgerEntry[];
}

export interface AddAmountEntryRepositoryDTO {
    agreementId: number;
    /** Variação (delta) em centavos; o valor vigente é a soma das linhas. */
    delta: number;
    effectiveAt: Date;
    reason: string;
}

export interface UpsertCycleRuleRepositoryDTO {
    agreementId: number;
    /** Meia-noite UTC do dia civil (`@db.Date`) */
    effectiveFrom: Date;
    dueDay: number;
    dueMonth: number | null;
    closingDay: number | null;
    closingMonth: number | null;
}

export interface IAgreementAdjustmentRepository {
    /** Acordo do contexto, restrito aos tipos de saldo do escopo (cartão/recorrência). */
    findAgreementContext(
        balanceId: number,
        contextId: number,
        balanceTypes: AdjustableBalanceType[]
    ): Promise<AgreementAdjustmentContext | null>;

    addAmountEntry(data: AddAmountEntryRepositoryDTO): Promise<{ id: number }>;

    /** Um CycleRule por (acordo, dia de vigência): no mesmo dia, atualiza. */
    upsertCycleRule(data: UpsertCycleRuleRepositoryDTO): Promise<{ id: number }>;

    /** Leitura + escrita do ajuste na mesma transação. */
    withTransaction<T>(
        work: (repo: IAgreementAdjustmentRepository) => Promise<T>
    ): Promise<T>;
}
