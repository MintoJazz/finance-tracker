import { RowAction } from "@/types/actions.types";
import { CardSummary } from "../../core/schemas/card.schema";

export interface CardActionContext {
    onEdit: (card: CardSummary) => void;
    onDelete: (card: CardSummary) => void;
}

export const CARD_ACTIONS: RowAction<CardSummary, CardActionContext>[] = [
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
