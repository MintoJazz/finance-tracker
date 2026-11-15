import { format } from "date-fns";
import { CycleOption } from "@/modules/cycles/models/cycle-option.schema";
import { AggregatedCycleRow } from "@/modules/cycles/application/interfaces/cycle-queries.interface";

export class CycleMapper {
    static toCycleOption(
        row: AggregatedCycleRow,
        balanceId: number
    ): CycleOption {
        const fromStr = format(row.from, "yyyy-MM-dd");
        const toStr = format(row.to, "yyyy-MM-dd");
        const dueStr = format(row.dueDate, "yyyy-MM-dd");

        return {
            from: fromStr,
            to: toStr,
            dueDate: dueStr,
            referenceDate: fromStr,
            label: row.label,
            status: row.status,
            totalAmount: row.totalAmount,
            paidAmount: row.paidAmount,
            remainingAmount: row.remainingAmount,
            isOverdue: row.isOverdue,
            balanceId,
            agreementId: balanceId,
        };
    }
}