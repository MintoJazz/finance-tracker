"use client";

import { useCallback, useMemo } from "react";
import { AmountAdjustmentDetailsSchema } from "@/modules/agreements/models/amount-adjustment.schema";
import { DEFAULT_EFFECTIVE_FROM } from "@/modules/agreements/models/effective-from.schema";
import { useAdjustModal } from "@/modules/agreements/ui/hooks/use-adjust-modal";
import {
    CardLimitAdjustmentSchema,
    type CardLimitAdjustmentValues,
} from "@/modules/cards/models/card-adjustment.schema";
import { cardLimitAdjustFields } from "@/modules/cards/ui/components/card-adjust-form/fields";
import { adjustCardLimitAction } from "@/modules/cards/ui/actions/adjust-card-limit.action";
import type { AdjustCardLimitModalInput, AdjustCardLimitModalProps } from "./types";

export function useAdjustCardLimitModal(
    input: AdjustCardLimitModalInput
): AdjustCardLimitModalProps {
    const persist = useCallback(
        (data: CardLimitAdjustmentValues) =>
            adjustCardLimitAction({ id: input.id, ...data }),
        [input.id]
    );

    const modal = useAdjustModal<CardLimitAdjustmentValues>({
        label: "Ajuste de limite",
        entityName: input.name,
        persist,
    });

    const initialData = useMemo<Partial<CardLimitAdjustmentValues>>(
        () => ({ amount: input.limit, reason: null, ...DEFAULT_EFFECTIVE_FROM }),
        [input.limit]
    );

    return {
        ...modal,
        title: "Ajustar limite",
        description: `Ajuste o limite de ${input.name}. Defina quando começa a valer.`,
        stepTitle: "Limite",
        schema: CardLimitAdjustmentSchema,
        detailsSchema: AmountAdjustmentDetailsSchema,
        fields: cardLimitAdjustFields,
        initialData,
    };
}
