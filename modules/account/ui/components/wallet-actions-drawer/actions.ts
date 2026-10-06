import { RowAction } from "@/types/actions.types";
import { WalletSummary } from "@/modules/account/core/schemas/wallet.schema";
import { Edit, Archive, RefreshCcw, Eye } from "lucide-react";

export interface WalletActionContext {
    onView?: (wallet: WalletSummary) => void;
    onEdit: (wallet: WalletSummary) => void;
    onRestore: (wallet: WalletSummary) => void;
    onArchive: (wallet: WalletSummary) => void;
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
    {
        id: "restore",
        label: "Desarquivar",
        icon: RefreshCcw,
        onClick: (row, context) => context?.onRestore(row.original),
        hidden: (row) => !row.original.isArchived,
    },
];

/** Ações exibidas dentro do perfil da carteira (sem "Ver detalhes", pois o usuário já está no perfil). */
export const WALLET_PROFILE_ACTIONS: RowAction<WalletSummary, WalletActionContext>[] =
    WALLET_ACTIONS.filter((action) => action.id !== WALLET_VIEW_ACTION_ID);