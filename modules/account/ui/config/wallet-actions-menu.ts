import { RowAction } from "@/types/actions.types";
import { WalletSummary } from "../../core/schemas/wallet.schema";
import { toast } from "@/components/ui/toast";

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
        hidden: (row) => !row.original.isArchived,
    },
    {
        label: "Desarquivar",
        onClick: (row) => {
            toast.add({
                title: "Carteira arquivada",
                description: `A ${row.original.name} foi desativada.`,
            })
        },
        hidden: (row) => row.original.isArchived,
    },
];
