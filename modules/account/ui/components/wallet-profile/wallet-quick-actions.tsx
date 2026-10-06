"use client";

import * as React from "react";
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, MoreHorizontal } from "lucide-react";
import { DataTableRowActions } from "@/components/actions/menu";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import { cn } from "@/lib/utils";
import { WalletProfile } from "@/modules/account/core/schemas/wallet-profile.schema";
import { WalletSummary } from "@/modules/account/core/schemas/wallet.schema";
import {
    WALLET_PROFILE_ACTIONS,
    WalletActionContext,
    WalletActionsDrawer,
} from "../wallet-actions-drawer";

interface WalletQuickActionsProps {
    wallet: WalletProfile;
    walletActionsContext?: WalletActionContext;
    onIncomeClick?: () => void;
    onExpenseClick?: () => void;
    onTransferClick?: () => void;
    className?: string;
}

export function WalletQuickActions({
    wallet,
    walletActionsContext,
    onIncomeClick,
    onExpenseClick,
    onTransferClick,
    className,
}: WalletQuickActionsProps) {
    const { isArchived } = wallet;
    const isDesktop = useIsDesktop();

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

    const optionsTrigger = (
        <button
            type="button"
            className="group flex flex-col items-center gap-1 cursor-pointer min-w-0"
        >
            <div className="w-full max-w-12 sm:max-w-13 h-9 sm:h-9.5 rounded-xl border border-border/70 bg-muted/60 dark:bg-muted/40 flex items-center justify-center transition-all group-hover:scale-105 active:scale-95 group-hover:bg-muted group-hover:shadow-xs">
                <MoreHorizontal className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
            <span className="text-[11px] font-medium text-foreground text-center truncate w-full">
                Opções
            </span>
        </button>
    );

    return (
        <div className={cn("grid grid-cols-4 gap-2 w-full", className)}>
            {/* 1. Receita (Verde / Emerald) */}
            <button
                type="button"
                disabled={isArchived}
                onClick={onIncomeClick}
                className="group flex flex-col items-center gap-1 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 min-w-0"
            >
                <div className="w-full max-w-12 sm:max-w-13 h-9 sm:h-9.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-500/15 dark:border-emerald-500/30 flex items-center justify-center transition-all group-hover:scale-105 active:scale-95 group-hover:bg-emerald-500/20 group-hover:shadow-xs">
                    <ArrowDownLeft className="size-4 text-emerald-600 dark:text-emerald-400 transition-transform group-hover:-translate-y-0.5" />
                </div>
                <span className="text-[11px] font-medium text-foreground text-center truncate w-full">
                    Receber
                </span>
            </button>

            {/* 2. Despesa (Vermelho / Rose) */}
            <button
                type="button"
                disabled={isArchived}
                onClick={onExpenseClick}
                className="group flex flex-col items-center gap-1 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 min-w-0"
            >
                <div className="w-full max-w-12 sm:max-w-13 h-9 sm:h-9.5 rounded-xl border border-rose-500/20 bg-rose-500/10 dark:bg-rose-500/15 dark:border-rose-500/30 flex items-center justify-center transition-all group-hover:scale-105 active:scale-95 group-hover:bg-rose-500/20 group-hover:shadow-xs">
                    <ArrowUpRight className="size-4 text-rose-600 dark:text-rose-400 transition-transform group-hover:-translate-y-0.5" />
                </div>
                <span className="text-[11px] font-medium text-foreground text-center truncate w-full">
                    Pagar
                </span>
            </button>

            {/* 3. Transferir (Azul / Blue) */}
            <button
                type="button"
                disabled={isArchived}
                onClick={onTransferClick}
                className="group flex flex-col items-center gap-1 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 min-w-0"
            >
                <div className="w-full max-w-12 sm:max-w-13 h-9 sm:h-9.5 rounded-xl border border-blue-500/20 bg-blue-500/10 dark:bg-blue-500/15 dark:border-blue-500/30 flex items-center justify-center transition-all group-hover:scale-105 active:scale-95 group-hover:bg-blue-500/20 group-hover:shadow-xs">
                    <ArrowLeftRight className="size-4 text-blue-600 dark:text-blue-400 transition-transform group-hover:scale-110" />
                </div>
                <span className="text-[11px] font-medium text-foreground text-center truncate w-full">
                    Transferir
                </span>
            </button>

            {/* 4. Opções */}
            {isDesktop ? (
                <DataTableRowActions
                    row={walletSummary}
                    actions={WALLET_PROFILE_ACTIONS}
                    context={walletActionsContext}
                    trigger={optionsTrigger}
                />
            ) : (
                <WalletActionsDrawer
                    wallet={walletSummary}
                    actions={WALLET_PROFILE_ACTIONS}
                    context={walletActionsContext}
                    trigger={optionsTrigger}
                />
            )}
        </div>
    );
}

export default WalletQuickActions;