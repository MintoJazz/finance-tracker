"use client";

import { useMemo } from "react";
import { useRowGlobalActions } from "@/components/global-actions";
import type { CardProfile } from "@/modules/cards/models/card-profile.schema";
import type { CardSummary } from "@/modules/cards/models/card.schema";
import {
    CARD_PROFILE_ACTIONS,
    type CardActionContext,
} from "../../../components/card-actions-drawer";

// "Pagar fatura" substitui o Pagar global (já com o cartão pré-selecionado).
const CARD_ACTION_OVERRIDES = {
    "pay-invoice": { id: "pay" },
};

export function useCardProfileGlobalActions(
    profile: CardProfile | null,
    context: CardActionContext
) {
    const row = useMemo<CardSummary | null>(
        () =>
            profile
                ? {
                      id: profile.id,
                      name: profile.name,
                      limit: profile.limit,
                      usedLimit: profile.usedLimit,
                      availableLimit: profile.availableLimit,
                      closingDay: profile.closingDay,
                      dueDay: profile.dueDay,
                      lastActivityAt: null,
                      isArchived: profile.isArchived,
                  }
                : null,
        [profile]
    );

    useRowGlobalActions({
        actions: CARD_PROFILE_ACTIONS,
        row,
        context,
        overrides: CARD_ACTION_OVERRIDES,
    });
}
