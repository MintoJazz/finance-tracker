import type { AdjustFormProps } from "@/modules/agreements/ui/components/adjust-form";
import type { CardLimitAdjustmentValues } from "@/modules/cards/models/card-adjustment.schema";

export interface AdjustCardLimitModalInput {
    id: number;
    name: string;
    /** Limite atual em centavos */
    limit: number;
}

export type AdjustCardLimitModalProps = AdjustFormProps<CardLimitAdjustmentValues>;
