import { actionsToCatalog } from "@/components/actions/catalog";
import { RowAction, ActionCatalog } from "@/types/actions.types";
import { WalletSummary } from "@/modules/account/core/schemas/wallet.schema";
import {
    ArrowDownLeft,
    ArrowLeftRight,
    ArrowUpRight,
    Edit,
    Archive,
    Eye,
} from "lucide-react";

export interface WalletActionContext {
    onView?: (wallet: WalletSummary) => void;
    onEdit: (wallet: WalletSummary) => void;
    onArchive: (wallet: WalletSummary) => void;
    onIncome?: (wallet: WalletSummary) => void;
    onExpense?: (wallet: WalletSummary) => void;
    onTransfer?: (wallet: WalletSummary) => void;
}

export const WALLET_VIEW_ACTION_ID = "view";

export const WALLET_ACTIONS: RowAction<WalletSummary, WalletActionContext>[] = [
    {
        id: WALLET_VIEW_ACTION_ID,
        label: "Ver detalhes",
        icon: Eye,
        onClick: (row, context) => context?.onView?.(row.original),
        hidden: (_row, context) => !context?.onView,
    },
    {
        id: "edit",
        label: "Editar",
        icon: Edit,
        onClick: (row, context) => context?.onEdit(row.original),
    },
    {
        id: "archive",
        label: "Arquivar",
        icon: Archive,
        variant: "destructive",
        onClick: (row, context) => context?.onArchive(row.original),
        hidden: (row) => row.original.isArchived,
    },
];

const WALLET_PROFILE_SPECIFIC_ACTIONS: ActionCatalog<
    WalletSummary,
    WalletActionContext
> = {
    income: {
        id: "income",
        label: "Receber",
        icon: ArrowDownLeft,
        color: "emerald",
        disabled: (row) => row.original.isArchived,
        onClick: (row, context) => context?.onIncome?.(row.original),
    },
    expense: {
        id: "expense",
        label: "Pagar",
        icon: ArrowUpRight,
        color: "rose",
        disabled: (row) => row.original.isArchived,
        onClick: (row, context) => context?.onExpense?.(row.original),
    },
    transfer: {
        id: "transfer",
        label: "Transferir",
        icon: ArrowLeftRight,
        color: "blue",
        disabled: (row) => row.original.isArchived,
        onClick: (row, context) => context?.onTransfer?.(row.original),
    },
};

const { view, ...defaultWalletActions } = actionsToCatalog(WALLET_ACTIONS);
void view;

export const WALLET_PROFILE_ACTIONS: ActionCatalog<
    WalletSummary,
    WalletActionContext
> = {
    ...WALLET_PROFILE_SPECIFIC_ACTIONS,
    ...defaultWalletActions,
};
