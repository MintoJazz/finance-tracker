import { actionsToCatalog } from "@/components/actions/catalog";
import { RowAction, ActionCatalog } from "@/types/actions.types";
import { CardSummary } from "@/modules/cards/models/card.schema";
import { CalendarClock, CreditCard, Edit, Archive, Eye, Receipt, SlidersHorizontal } from "lucide-react";

export interface CardActionContext {
    onView?: (card: CardSummary) => void;
    onEdit: (card: CardSummary) => void;
    onArchive: (card: CardSummary) => void;
    onExpense?: (card: CardSummary) => void;
    onPayInvoice?: (card: CardSummary) => void;
    /** Registra um novo AgreementAmountEntry (limite). */
    onAdjustLimit?: (card: CardSummary) => void;
    /** Registra um novo CycleRule (fechamento/vencimento da fatura). */
    onAdjustDeadlines?: (card: CardSummary) => void;
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

const CARD_PROFILE_SPECIFIC_ACTIONS: ActionCatalog<
    CardSummary,
    CardActionContext
> = {
    expense: {
        id: "expense",
        label: "Comprar",
        icon: CreditCard,
        disabled: (row) => row.original.isArchived,
        onClick: (row, context) => context?.onExpense?.(row.original),
    },
    payInvoice: {
        id: "pay-invoice",
        label: "Pagar",
        icon: Receipt,
        disabled: (row) => row.original.isArchived,
        onClick: (row, context) => context?.onPayInvoice?.(row.original),
    },
    adjustLimit: {
        id: "adjust-limit",
        label: "Limite",
        icon: SlidersHorizontal,
        disabled: (row) => row.original.isArchived,
        onClick: (row, context) => context?.onAdjustLimit?.(row.original),
        hidden: (_row, context) => !context?.onAdjustLimit,
    },
    adjustDeadlines: {
        id: "adjust-deadlines",
        label: "Prazos",
        icon: CalendarClock,
        disabled: (row) => row.original.isArchived,
        onClick: (row, context) => context?.onAdjustDeadlines?.(row.original),
        hidden: (_row, context) => !context?.onAdjustDeadlines,
    },
};

const { view, ...defaultCardActions } = actionsToCatalog(CARD_ACTIONS);
void view;

export const CARD_PROFILE_ACTIONS: ActionCatalog<CardSummary, CardActionContext> = {
    ...CARD_PROFILE_SPECIFIC_ACTIONS,
    ...defaultCardActions,
};
