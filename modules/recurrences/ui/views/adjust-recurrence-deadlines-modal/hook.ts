"use client";

import { useCallback, useMemo } from "react";
import { useAdjustModal } from "@/modules/agreements/ui/hooks/use-adjust-modal";
import { DEFAULT_EFFECTIVE_FROM } from "@/modules/agreements/models/effective-from.schema";
import {
    RecurrenceDeadlinesAdjustmentDetailsSchema,
    RecurrenceDeadlinesAdjustmentSchema,
    type RecurrenceDeadlinesAdjustmentValues,
} from "@/modules/recurrences/models/schemas/recurrence-adjustment.schema";
import { deadlineFields } from "@/modules/recurrences/ui/components/recurrence-form/fields";
import { adjustRecurrenceDeadlinesAction } from "@/modules/recurrences/ui/actions/adjust-recurrence-deadlines.action";
import type {
    AdjustRecurrenceDeadlinesModalInput,
    AdjustRecurrenceDeadlinesModalProps,
} from "./types";

export function useAdjustRecurrenceDeadlinesModal(
    input: AdjustRecurrenceDeadlinesModalInput
): AdjustRecurrenceDeadlinesModalProps {
    const persist = useCallback(
        (data: RecurrenceDeadlinesAdjustmentValues) =>
            adjustRecurrenceDeadlinesAction({ balanceId: input.balanceId, ...data }),
        [input.balanceId]
    );

    const modal = useAdjustModal<RecurrenceDeadlinesAdjustmentValues>({
        label: "Ajuste de prazos",
        entityName: input.name,
        persist,
    });

    const initialData = useMemo<Partial<RecurrenceDeadlinesAdjustmentValues>>(
        () => ({
            frequency: input.frequency,
            hasCustomClosingDate: input.closingDay != null,
            dueDay: input.dueDay,
            dueMonth: input.dueMonth,
            closingDay: input.closingDay ?? null,
            closingMonth: input.closingMonth ?? null,
            ...DEFAULT_EFFECTIVE_FROM,
        }),
        [input]
    );

    return {
        ...modal,
        title: "Ajustar prazos",
        description: `Ajuste o vencimento e o fechamento de ${input.name}. Defina quando começa a valer.`,
        stepTitle: "Prazos",
        schema: RecurrenceDeadlinesAdjustmentSchema,
        detailsSchema: RecurrenceDeadlinesAdjustmentDetailsSchema,
        fields: deadlineFields,
        initialData,
    };
}
