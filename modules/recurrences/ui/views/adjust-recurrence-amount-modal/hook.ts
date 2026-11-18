"use client";

import { useCallback, useMemo } from "react";
import { useAdjustModal } from "@/modules/agreements/ui/hooks/use-adjust-modal";
import { AmountAdjustmentDetailsSchema } from "@/modules/agreements/models/amount-adjustment.schema";
import { DEFAULT_EFFECTIVE_FROM } from "@/modules/agreements/models/effective-from.schema";
import {
    RecurrenceAmountAdjustmentSchema,
    type RecurrenceAmountAdjustmentValues,
} from "@/modules/recurrences/models/schemas/recurrence-adjustment.schema";
import { recurrenceAmountAdjustFields } from "@/modules/recurrences/ui/components/recurrence-adjust-form/fields";
import { adjustRecurrenceAmountAction } from "@/modules/recurrences/ui/actions/adjust-recurrence-amount.action";
import type {
    AdjustRecurrenceAmountModalInput,
    AdjustRecurrenceAmountModalProps,
} from "./types";

export function useAdjustRecurrenceAmountModal(
    input: AdjustRecurrenceAmountModalInput
): AdjustRecurrenceAmountModalProps {
    const persist = useCallback(
        (data: RecurrenceAmountAdjustmentValues) =>
            adjustRecurrenceAmountAction({ balanceId: input.balanceId, ...data }),
        [input.balanceId]
    );

    const modal = useAdjustModal<RecurrenceAmountAdjustmentValues>({
        label: "Ajuste de valor",
        entityName: input.name,
        persist,
    });

    const initialData = useMemo<Partial<RecurrenceAmountAdjustmentValues>>(
        () => ({
            amount: input.currentAmount,
            reason: null,
            ...DEFAULT_EFFECTIVE_FROM,
        }),
        [input.currentAmount]
    );

    return {
        ...modal,
        title: "Ajustar valor",
        description: `Ajuste o valor de ${input.name}. Defina quando começa a valer.`,
        stepTitle: "Valores",
        schema: RecurrenceAmountAdjustmentSchema,
        detailsSchema: AmountAdjustmentDetailsSchema,
        fields: recurrenceAmountAdjustFields,
        initialData,
    };
}
