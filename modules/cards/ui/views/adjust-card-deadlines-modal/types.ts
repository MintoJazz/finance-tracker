import type { AdjustFormProps } from "@/modules/agreements/ui/components/adjust-form";
import type { CardDeadlinesAdjustmentValues } from "@/modules/cards/models/card-adjustment.schema";

export interface AdjustCardDeadlinesModalInput {
    id: number;
    name: string;
    closingDay: number;
    dueDay: number;
}

export type AdjustCardDeadlinesModalProps =
    AdjustFormProps<CardDeadlinesAdjustmentValues>;
