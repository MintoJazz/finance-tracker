import { formatDate } from "@/lib/formatters";
import type {
    InstallmentItemStatus,
    InstallmentListItem,
    InstallmentStatus,
    InstallmentType,
} from "@/modules/installments/models/schemas/installment-item.schema";

export const INSTALLMENT_TYPE_LABELS: Record<InstallmentType, string> = {
    INVOICE: "Em fatura",
    MONTHLY: "Mês a mês",
};

export const INSTALLMENT_TYPE_FILTER_THEMES: Record<
    InstallmentType | "ALL",
    { label: string }
> = {
    ALL: { label: "Todos" },
    INVOICE: { label: INSTALLMENT_TYPE_LABELS.INVOICE },
    MONTHLY: { label: INSTALLMENT_TYPE_LABELS.MONTHLY },
};

export const INSTALLMENT_STATUS_FILTER_THEMES: Record<
    InstallmentStatus,
    { label: string }
> = {
    ALL: { label: "Todos" },
    ACTIVE: { label: "Em andamento" },
    OVERDUE: { label: "Atrasados" },
    PAID: { label: "Quitados" },
};

export const INSTALLMENT_STATUS_THEMES: Record<
    InstallmentItemStatus,
    { label: string; badgeClassName: string }
> = {
    ACTIVE: {
        label: "Em andamento",
        badgeClassName:
            "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    },
    OVERDUE: {
        label: "Atrasado",
        badgeClassName:
            "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
    },
    PAID: {
        label: "Quitado",
        badgeClassName: "text-muted-foreground border-border",
    },
};

/** Origem da parcela: nome do cartão (em fatura) ou "Mês a mês". */
export function getInstallmentSourceLabel(
    item: Pick<InstallmentListItem, "type" | "card">
): string {
    return item.type === "INVOICE" && item.card
        ? item.card.name
        : INSTALLMENT_TYPE_LABELS.MONTHLY;
}

/** Vencimento da próxima parcela, ou "Quitado" quando não há mais parcelas. */
export function formatInstallmentNextDue(
    item: Pick<InstallmentListItem, "nextDueDate">,
    { withPrefix = false }: { withPrefix?: boolean } = {}
): string {
    if (!item.nextDueDate) return "Quitado";
    const date = formatDate(item.nextDueDate);
    return withPrefix ? `Próx. ${date}` : date;
}
