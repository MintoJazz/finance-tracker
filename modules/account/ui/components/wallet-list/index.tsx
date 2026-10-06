"use client";

import { useState } from "react";
import { Page } from "@/types/pagination.types";
import { WalletSummary } from "@/modules/account/core/schemas/wallet.schema";
import {
    WalletActionContext,
    WalletActionsDrawer,
} from "../wallet-actions-drawer";
import WalletListItem from "./list-item";
import EmptyWalletList from "./empty";
import { cn } from "cn";

interface Props {
    data: Page<WalletSummary> | WalletSummary[];
    actionContext: WalletActionContext;
    className?: string;
}

export default function WalletList({ data, actionContext, className }: Props) {
    const items = Array.isArray(data) ? data : data.data;
    const [activeWallet, setActiveWallet] = useState<WalletSummary | null>(null);

    if (items.length === 0) {
        return (
            <div className={cn("px-4", className)}>
                <EmptyWalletList />
            </div>
        );
    }

    return (
        <div
            className={cn(
                "w-full flex flex-col divide-y divide-border border-y border-border",
                className
            )}
        >
            {items.map((wallet) => (
                <WalletListItem
                    key={wallet.id}
                    wallet={wallet}
                    onSelect={
                        actionContext.onView
                            ? () => actionContext.onView?.(wallet)
                            : undefined
                    }
                    onOpenActions={() => setActiveWallet(wallet)}
                />
            ))}

            <WalletActionsDrawer
                open={!!activeWallet}
                onOpenChange={(open) => {
                    if (!open) setActiveWallet(null);
                }}
                wallet={activeWallet}
                context={actionContext}
                trigger={null}
            />
        </div>
    );
}