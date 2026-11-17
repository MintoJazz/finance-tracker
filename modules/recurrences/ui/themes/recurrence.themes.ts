import type {
    RecurrenceDirection,
    RecurrenceFrequency,
    RecurrenceItemStatus,
    RecurrenceListItem,
    RecurrenceStatus,
} from "@/modules/recurrences/models/schemas/recurrence-item.schema";

export const RECURRENCE_FREQUENCY_LABELS: Record<RecurrenceFrequency, string> = {
    WEEKLY: "Semanal",
    MONTHLY: "Mensal",
    YEARLY: "Anual",
};

export const RECURRENCE_DIRECTION_FILTER_THEMES: Record<
    RecurrenceDirection | "ALL",
    { label: string }
> = {
    ALL: { label: "Todas" },
    CREDIT: { label: "Entradas" },
    DEBIT: { label: "Saídas" },
};

export const RECURRENCE_STATUS_FILTER_THEMES: Record<
    RecurrenceStatus,
    { label: string }
> = {
    ALL: { label: "Todas" },
    ACTIVE: { label: "Ativas" },
    OVERDUE: { label: "Em atraso" },
    INACTIVE: { label: "Inativas" },
};

export const RECURRENCE_WEEKDAY_LABELS: Record<number, string> = {
    0: "Domingo",
    1: "Segunda-feira",
    2: "Terça-feira",
    3: "Quarta-feira",
    4: "Quinta-feira",
    5: "Sexta-feira",
    6: "Sábado",
};

export const RECURRENCE_MONTH_LABELS: Record<number, string> = {
    1: "jan.",
    2: "fev.",
    3: "mar.",
    4: "abr.",
    5: "mai.",
    6: "jun.",
    7: "jul.",
    8: "ago.",
    9: "set.",
    10: "out.",
    11: "nov.",
    12: "dez.",
};

/**
 * Formata o vencimento conforme a frequência da recorrência:
 * - Semanal: dia da semana
 * - Mensal: dia do mês
 * - Anual: dia e mês
 */
export function formatRecurrenceDue(
    item: Pick<RecurrenceListItem, "frequency" | "dueDay" | "dueMonth">,
    options?: { withPrefix?: boolean }
): string {
    switch (item.frequency) {
        case "WEEKLY": {
            const weekday = RECURRENCE_WEEKDAY_LABELS[item.dueDay % 7] ?? "—";
            return options?.withPrefix ? `Vence: ${weekday}` : weekday;
        }
        case "MONTHLY": {
            return options?.withPrefix
                ? `Vence dia ${item.dueDay}`
                : `Dia ${item.dueDay}`;
        }
        case "YEARLY": {
            const monthLabel = item.dueMonth
                ? RECURRENCE_MONTH_LABELS[item.dueMonth]
                : null;
            const formatted = monthLabel
                ? `${String(item.dueDay).padStart(2, "0")} de ${monthLabel}`
                : `Dia ${item.dueDay}`;
            return options?.withPrefix ? `Vence em ${formatted}` : formatted;
        }
    }
}

export interface RecurrenceStatusTheme {
    label: string;
    badgeClassName: string;
}

/**
 * Registry de temas visuais para os status de recorrência.
 */
export const RECURRENCE_STATUS_THEMES: Record<
    RecurrenceItemStatus,
    RecurrenceStatusTheme
> = {
    ACTIVE: {
        label: "Ativa",
        badgeClassName:
            "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    },
    OVERDUE: {
        label: "Em atraso",
        badgeClassName:
            "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
    },
    INACTIVE: {
        label: "Inativa",
        badgeClassName: "text-muted-foreground border-border",
    },
};

