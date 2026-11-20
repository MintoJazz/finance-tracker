import { Archive, Edit, Eye } from "lucide-react";
import type { RowAction } from "@/types/actions.types";
import type { InstallmentListItem } from "@/modules/installments/models/schemas/installment-item.schema";

export interface InstallmentActionContext {
    onView?: (installment: InstallmentListItem) => void;
    onEdit?: (installment: InstallmentListItem) => void;
    /** Abre a confirmação de arquivamento. */
    onArchive?: (installment: InstallmentListItem) => void;
}

export const INSTALLMENT_ACTIONS: RowAction<
    InstallmentListItem,
    InstallmentActionContext
>[] = [
    {
        id: "view",
        label: "Ver detalhes",
        icon: Eye,
        onClick: (row, context) => context?.onView?.(row.original),
        hidden: (_row, context) => !context?.onView,
    },
    {
        id: "edit",
        label: "Editar",
        icon: Edit,
        onClick: (row, context) => context?.onEdit?.(row.original),
        hidden: (_row, context) => !context?.onEdit,
    },
    {
        id: "archive",
        label: "Arquivar",
        icon: Archive,
        variant: "destructive",
        onClick: (row, context) => context?.onArchive?.(row.original),
        hidden: (_row, context) => !context?.onArchive,
    },
];
