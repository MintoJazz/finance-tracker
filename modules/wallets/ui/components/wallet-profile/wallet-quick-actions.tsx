"use client";

import * as React from "react";
import { QuickActions } from "@/components/quick-actions";
import { WalletProfile } from "@/modules/wallets/models/wallet-profile.schema";
import { WalletSummary } from "@/modules/wallets/models/wallet.schema";
import {
    WALLET_PROFILE_ACTIONS,
    WalletActionContext,
    WalletActionsDrawerHeader,
} from "../wallet-actions-drawer";

interface WalletQuickActionsProps {
    wallet: WalletProfile;
    walletActionsContext?: WalletActionContext;
    className?: string;
}

export function WalletQuickActions({
    wallet,
    walletActionsContext,
    className,
}: WalletQuickActionsProps) {
    const walletSummary = React.useMemo<WalletSummary>(
        () => ({
            id: wallet.id,
            name: wallet.name,
            amount: wallet.currentBalance,
            lastActivityAt: null,
            isArchived: wallet.isArchived,
        }),
        [wallet]
    );

    return (
        <QuickActions
            row={walletSummary}
            actions={WALLET_PROFILE_ACTIONS}
            context={walletActionsContext}
            optionsHeader={<WalletActionsDrawerHeader wallet={walletSummary} />}
            className={className}
        />
    );
}

export default WalletQuickActions;
