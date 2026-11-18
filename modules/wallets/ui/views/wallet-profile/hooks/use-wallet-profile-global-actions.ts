"use client";

import { useMemo } from "react";
import { useRowGlobalActions } from "@/components/global-actions";
import type { WalletProfile } from "@/modules/wallets/models/wallet-profile.schema";
import type { WalletSummary } from "@/modules/wallets/models/wallet.schema";
import {
    WALLET_PROFILE_ACTIONS,
    type WalletActionContext,
} from "../../../components/wallet-actions-drawer";

// Receber/Pagar da carteira substituem os globais (já com a carteira pré-selecionada).
const WALLET_ACTION_OVERRIDES = {
    income: { id: "receive" },
    expense: { id: "pay" },
};

export function useWalletProfileGlobalActions(
    profile: WalletProfile | null,
    context: WalletActionContext
) {
    const row = useMemo<WalletSummary | null>(
        () =>
            profile
                ? {
                      id: profile.id,
                      name: profile.name,
                      amount: profile.currentBalance,
                      lastActivityAt: null,
                      isArchived: profile.isArchived,
                  }
                : null,
        [profile]
    );

    useRowGlobalActions({
        actions: WALLET_PROFILE_ACTIONS,
        row,
        context,
        overrides: WALLET_ACTION_OVERRIDES,
    });
}
