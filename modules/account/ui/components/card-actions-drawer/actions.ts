import { RowAction } from "@/types/actions.types";
import { CardSummary } from "@/modules/account/core/schemas/card.schema";
import { Edit, Archive, Eye } from "lucide-react";

export interface CardActionContext {
    onView?: (card: CardSummary) => void;
    onEdit: (card: CardSummary) => void;
    onArchive: (card: CardSummary) => void;
}

export const CARD_VIEW_ACTION_ID = "view";

export const CARD_ACTIONS: RowAction<CardSummary, CardActionContext>[] = [
    {
        id: CARD_VIEW_ACTION_ID,
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

export const CARD_PROFILE_ACTIONS: RowAction<CardSummary, CardActionContext>[] =
    CARD_ACTIONS.filter((action) => action.id !== CARD_VIEW_ACTION_ID);