import { z } from "zod";
import { CycleItem } from "../../models/cycle-item.schema";
import { CycleStatus } from "../../models/cycle-primitives.schema";

export type CycleFinancialRole = "OVERDUE" | "PENDING" | "SETTLED";

export const CommitmentsPeriodSummarySchema = z.object({
    totalAmount: z.number().int().nonnegative(),
    paidAmount: z.number().int().nonnegative(),
    pendingAmount: z.number().int().nonnegative(),
    overdueAmount: z.number().int().nonnegative(),
    overdueCount: z.number().int().nonnegative(),
});

export type CommitmentsPeriodSummary = z.infer<typeof CommitmentsPeriodSummarySchema>;

export const COMMITMENT_STATUS_FINANCIAL_ROLE: Record<
    CycleStatus,
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

export class CycleSummaryCalculator {
    static summarize(cycles: Pick<CycleItem, "totalAmount" | "paidAmount" | "remainingAmount" | "status">[]): CommitmentsPeriodSummary {
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