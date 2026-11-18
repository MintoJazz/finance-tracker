"use client";

import { useCallback, useMemo } from "react";
import { DEFAULT_EFFECTIVE_FROM } from "@/modules/agreements/models/effective-from.schema";
import { useAdjustModal } from "@/modules/agreements/ui/hooks/use-adjust-modal";
import {
    CardDeadlinesAdjustmentSchema,
    CardDeadlinesDetailsSchema,
    type CardDeadlinesAdjustmentValues,
} from "@/modules/cards/models/card-adjustment.schema";
import { cardDeadlinesAdjustFields } from "@/modules/cards/ui/components/card-adjust-form/fields";
import { adjustCardDeadlinesAction } from "@/modules/cards/ui/actions/adjust-card-deadlines.action";
import type {
    AdjustCardDeadlinesModalInput,
    AdjustCardDeadlinesModalProps,
} from "./types";

export function useAdjustCardDeadlinesModal(
    input: AdjustCardDeadlinesModalInput
): AdjustCardDeadlinesModalProps {
    const persist = useCallback(
        (data: CardDeadlinesAdjustmentValues) =>
            adjustCardDeadlinesAction({ id: input.id, ...data }),
        [input.id]
    );

    const modal = useAdjustModal<CardDeadlinesAdjustmentValues>({
        label: "Ajuste de prazos",
        entityName: input.name,
        persist,
    });

    const initialData = useMemo<Partial<CardDeadlinesAdjustmentValues>>(
        () => ({
            closingDay: input.closingDay,
            dueDay: input.dueDay,
            ...DEFAULT_EFFECTIVE_FROM,
        }),
        [input.closingDay, input.dueDay]
    );

    return {
        ...modal,
        title: "Ajustar prazos",
        description: `Ajuste o fechamento e o vencimento da fatura de ${input.name}. Defina quando começa a valer.`,
        stepTitle: "Prazos",
        schema: CardDeadlinesAdjustmentSchema,
        detailsSchema: CardDeadlinesDetailsSchema,
        fields: cardDeadlinesAdjustFields,
        initialData,
    };
}
