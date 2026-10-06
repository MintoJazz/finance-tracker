import { RowAction } from "@/types/actions.types";
import { Info, Receipt } from "lucide-react";
import { WalletMovement } from "@/modules/ledger/core/schemas/wallet-movement.schema";

export interface MovementActionContext {
    onViewDetails?: (movement: WalletMovement) => void;
    onViewReceipt?: (movement: WalletMovement) => void;
}

export const MOVEMENT_ACTIONS: RowAction<WalletMovement, MovementActionContext>[] = [
    {
        id: "view-details",
        label: "Ver detalhes",
        icon: Info,
        onClick: (row, context) => context?.onViewDetails?.(row.original),
    },
    {
        id: "view-receipt",
        label: "Ver comprovante",
        icon: Receipt,
        hidden: (row) => !row.original.hasReceipt,
        onClick: (row, context) => context?.onViewReceipt?.(row.original),
    },
];