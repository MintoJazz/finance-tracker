import { format } from "date-fns";
import { toCivilDate } from "@/lib/formatters";
import { CycleOption } from "@/modules/cycles/models/cycle-option.schema";
import { AggregatedCycleRow } from "@/modules/cycles/application/interfaces/cycle-queries.interface";

export class CycleMapper {
    static toCycleOption(
        row: AggregatedCycleRow,
        balanceId: number
    ): CycleOption {
        const fromStr = format(toCivilDate(row.from), "yyyy-MM-dd");
        const toStr = format(toCivilDate(row.to), "yyyy-MM-dd");
        const dueStr = format(toCivilDate(row.dueDate), "yyyy-MM-dd");

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