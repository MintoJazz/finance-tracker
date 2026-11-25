import {
    Archive,
    CalendarClock,
    CreditCard,
    Edit,
    Eye,
    SlidersHorizontal,
    Tag,
} from "lucide-react";
import type { RowAction } from "@/types/actions.types";
import {
    isFullyConsolidated,
    type InstallmentListItem,
} from "@/modules/installments/models/schemas/installment-item.schema";

export interface InstallmentActionContext {
    onView?: (installment: InstallmentListItem) => void;
    /** Edição cadastral (apenas Nome). Sempre liberada, mesmo 100% consolidado. */
    onEdit?: (installment: InstallmentListItem) => void;
    /** Troca de categoria (com seletor de escopo: abertas ou todo o parcelamento). */
    onChangeCategory?: (installment: InstallmentListItem) => void;
    /** Fluxo exclusivo de Valores e Parcelas (reconciliação de valor e quantidade). */
    onAdjustValues?: (installment: InstallmentListItem) => void;
    /** Ajuste do dia de vencimento (exclusivo de MONTHLY; oculto completamente em INVOICE). */
    onAdjustDeadlines?: (installment: InstallmentListItem) => void;
    /** Troca de cartão (exclusivo de INVOICE; oculto completamente em MONTHLY). */
    onChangeCard?: (installment: InstallmentListItem) => void;
    /** Abre a confirmação de arquivamento irreversível. */
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
        label: "Editar nome",
        icon: Edit,
        onClick: (row, context) => context?.onEdit?.(row.original),
        hidden: (row, context) => !context?.onEdit || row.original.isArchived,
    },
    {
        id: "change-category",
        label: "Trocar categoria",
        icon: Tag,
        onClick: (row, context) => context?.onChangeCategory?.(row.original),
        hidden: (row, context) =>
            !context?.onChangeCategory || row.original.isArchived,
    },
    {
        id: "adjust-values",
        label: "Ajustar valores e parcelas",
        icon: SlidersHorizontal,
        onClick: (row, context) => context?.onAdjustValues?.(row.original),
        hidden: (row, context) =>
            !context?.onAdjustValues || row.original.isArchived,
        disabled: (row) => isFullyConsolidated(row.original),
    },
    {
        id: "adjust-deadlines",
        label: "Ajustar vencimento",
        icon: CalendarClock,
        onClick: (row, context) => context?.onAdjustDeadlines?.(row.original),
        hidden: (row, context) =>
            !context?.onAdjustDeadlines ||
            row.original.isArchived ||
            row.original.type !== "MONTHLY",
        disabled: (row) => isFullyConsolidated(row.original),
    },
    {
        id: "change-card",
        label: "Trocar cartão",
        icon: CreditCard,
        onClick: (row, context) => context?.onChangeCard?.(row.original),
        hidden: (row, context) =>
            !context?.onChangeCard ||
            row.original.isArchived ||
            row.original.type !== "INVOICE",
        disabled: (row) => isFullyConsolidated(row.original),
    },
    {
        id: "archive",
        label: "Arquivar",
        icon: Archive,
        variant: "destructive",
        onClick: (row, context) => context?.onArchive?.(row.original),
        hidden: (row, context) => !context?.onArchive || row.original.isArchived,
    },
];
