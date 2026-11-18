import type { AdjustFormProps } from "@/modules/agreements/ui/components/adjust-form";
import type { RecurrenceAmountAdjustmentValues } from "@/modules/recurrences/models/schemas/recurrence-adjustment.schema";

export interface AdjustRecurrenceAmountModalInput {
    balanceId: number;
    name: string;
    /** Valor atual em centavos */
    currentAmount: number;
}

export type AdjustRecurrenceAmountModalProps =
    AdjustFormProps<RecurrenceAmountAdjustmentValues>;
