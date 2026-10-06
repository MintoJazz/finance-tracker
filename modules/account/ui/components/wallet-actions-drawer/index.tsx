"use client";

import * as React from "react";
import { ActionsDrawer } from "@/components/actions/drawer";
import { RowAction } from "@/types/actions.types";
import { WalletSummary } from "@/modules/account/core/schemas/wallet.schema";
import { WALLET_ACTIONS, WalletActionContext } from "./actions";
import { WalletActionsDrawerHeader } from "./header";

export interface WalletActionsDrawerProps {
    wallet?: WalletSummary | null;
    context?: WalletActionContext;
    actions?: RowAction<WalletSummary, WalletActionContext>[];
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactElement | null;
}

export function WalletActionsDrawer({
    wallet,
    context,
    actions = WALLET_ACTIONS,
    open,
    onOpenChange,
    trigger,
}: WalletActionsDrawerProps) {
    return (
        <ActionsDrawer
            open={open}
            onOpenChange={onOpenChange}
            row={wallet ?? undefined}
            actions={actions}
            context={context}
            trigger={trigger}
            header={
                wallet ? <WalletActionsDrawerHeader wallet={wallet} /> : null
            }
        />
    );
}

export default WalletActionsDrawer;
export * from "./actions";
export * from "./header";