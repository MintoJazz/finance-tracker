import { RowAction } from "@/types/actions.types";
import { WalletSummary } from "../../core/schemas/wallet.schema";

export interface WalletActionContext {
    onEdit: (wallet: WalletSummary) => void;
    onDelete: (wallet: WalletSummary) => void;
}

export const WALLET_ACTIONS: RowAction<WalletSummary, WalletActionContext>[] = [
    {
        label: "Editar",
        onClick: (row, context) => context?.onEdit(row.original),
    },
    {
        label: "Arquivar",
        variant: "destructive",
        onClick: (row, context) => context?.onDelete(row.original),
    },
];
