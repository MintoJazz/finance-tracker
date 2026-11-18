import { Archive, ArchiveRestore, CalendarClock, Edit, Eye, Power, PowerOff, SlidersHorizontal } from "lucide-react";
import type { RowAction } from "@/types/actions.types";
import type { RecurrenceListItem } from "@/modules/recurrences/models/schemas/recurrence-item.schema";

export interface RecurrenceActionContext {
    onView?: (recurrence: RecurrenceListItem) => void;
    onEdit?: (recurrence: RecurrenceListItem) => void;
    /** Registra um novo AgreementAmountEntry (valor esperado). */
    onAdjustAmount?: (recurrence: RecurrenceListItem) => void;
    /** Registra um novo CycleRule (vencimento/fechamento). */
    onAdjustDeadlines?: (recurrence: RecurrenceListItem) => void;
    /** Ativa uma recorrência desativada (Agreement.isActive = true). */
    onActivate?: (recurrence: RecurrenceListItem) => void;
    /** Desativa uma recorrência (Agreement.isActive = false). */
    onDeactivate?: (recurrence: RecurrenceListItem) => void;
    /** Abre a confirmação de arquivamento. */
    onArchive?: (recurrence: RecurrenceListItem) => void;
    /** Abre a confirmação de desarquivamento. */
    onRestore?: (recurrence: RecurrenceListItem) => void;
}

export const RECURRENCE_ACTIONS: RowAction<
    RecurrenceListItem,
    RecurrenceActionContext
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
            hidden: (row, context) => !context?.onEdit || row.original.isArchived,
        },
        {
            id: "adjust-amount",
            label: "Ajustar valor",
            icon: SlidersHorizontal,
            onClick: (row, context) => context?.onAdjustAmount?.(row.original),
            hidden: (row, context) => !context?.onAdjustAmount || row.original.isArchived,
            disabled: (row) => !row.original.isActive,
        },
        {
            id: "adjust-deadlines",
            label: "Ajustar prazos",
            icon: CalendarClock,
            onClick: (row, context) => context?.onAdjustDeadlines?.(row.original),
            hidden: (row, context) => !context?.onAdjustDeadlines || row.original.isArchived,
            disabled: (row) => !row.original.isActive,
        },
        {
            id: "deactivate",
            label: "Desativar",
            icon: PowerOff,
            onClick: (row, context) => context?.onDeactivate?.(row.original),
            hidden: (row, context) =>
                !context?.onDeactivate || row.original.isArchived || !row.original.isActive,
        },
        {
            id: "activate",
            label: "Ativar",
            icon: Power,
            onClick: (row, context) => context?.onActivate?.(row.original),
            hidden: (row, context) =>
                !context?.onActivate || row.original.isArchived || row.original.isActive,
        },
        {
            id: "archive",
            label: "Arquivar",
            icon: Archive,
            variant: "destructive",
            onClick: (row, context) => context?.onArchive?.(row.original),
            hidden: (row, context) => !context?.onArchive || row.original.isArchived,
        },
        {
            id: "restore",
            label: "Desarquivar",
            icon: ArchiveRestore,
            onClick: (row, context) => context?.onRestore?.(row.original),
            hidden: (row, context) => !context?.onRestore || !row.original.isArchived,
        },
    ];
