import {
    CommitmentCycleItem,
    CommitmentCycleStatusEnum,
    CommitmentsPeriodSummary,
} from "../../models/commitment-cycle.schema";

export type CycleFinancialRole = "OVERDUE" | "PENDING" | "SETTLED";

/**
 * Mapeamento Strategy/Classifier que associa cada status de ciclo ao seu papel financeiro
 * na sumarização do período de planejamento.
 */
export const COMMITMENT_STATUS_FINANCIAL_ROLE: Record<
    CommitmentCycleStatusEnum,
    CycleFinancialRole
> = {
    OVERDUE: "OVERDUE",
    OPEN: "PENDING",
    PENDING: "PENDING",
    PARTIAL: "PENDING",
    PROJECTED: "PENDING",
    UNRECORDED: "PENDING",
    PAID: "SETTLED",
    SETTLED: "SETTLED",
    TRANSFERRED: "SETTLED",
};

/**
 * Calculadora pura responsável por totalizar os valores e contagens dos ciclos.
 */
export class CycleSummaryCalculator {
    static summarize(cycles: CommitmentCycleItem[]): CommitmentsPeriodSummary {
        let totalAmount = 0;
        let paidAmount = 0;
        let overdueAmount = 0;
        let overdueCount = 0;
        let pendingAmount = 0;

        for (const cycle of cycles) {
            totalAmount += cycle.totalAmount;
            paidAmount += cycle.paidAmount;

            const role = COMMITMENT_STATUS_FINANCIAL_ROLE[cycle.status];
            if (role === "OVERDUE") {
                overdueAmount += cycle.remainingAmount;
                overdueCount += 1;
            } else if (role === "PENDING") {
                pendingAmount += cycle.remainingAmount;
            }
            // "SETTLED" não incrementa valores em aberto
        }

        return {
            totalAmount,
            paidAmount,
            pendingAmount,
            overdueAmount,
            overdueCount,
        };
    }
}
