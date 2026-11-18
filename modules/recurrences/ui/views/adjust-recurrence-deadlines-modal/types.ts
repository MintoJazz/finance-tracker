import type { AdjustFormProps } from "@/modules/agreements/ui/components/adjust-form";
import type { RecurrenceDeadlinesAdjustmentValues } from "@/modules/recurrences/models/schemas/recurrence-adjustment.schema";
import type { RecurrenceListItem } from "@/modules/recurrences/models/schemas/recurrence-item.schema";

export interface AdjustRecurrenceDeadlinesModalInput {
    balanceId: number;
    name: string;
    frequency: RecurrenceListItem["frequency"];
    dueDay: number;
    dueMonth: number | null;
    closingDay?: number | null;
    closingMonth?: number | null;
}

export type AdjustRecurrenceDeadlinesModalProps =
    AdjustFormProps<RecurrenceDeadlinesAdjustmentValues>;
