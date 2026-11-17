import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { UseFormSetValue } from "react-hook-form";
import type {
    RecurrenceFormFrequency,
    RecurrenceFormValues,
} from "@/modules/recurrences/models/schemas/recurrence-form.schema";
import { RECURRENCE_WEEKDAY_LABELS } from "@/modules/recurrences/ui/themes/recurrence.themes";

/** Date local -> "YYYY-MM-DD" (sem passar por UTC, evita deslocar o dia). */
export function toDateString(date: Date | undefined | null): string | null {
    if (!date) return null;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

/** "YYYY-MM-DD" -> Date local ao meio-dia (evita virar o dia anterior em UTC-3). */
export function fromDateString(value: string | null | undefined): Date | undefined {
    if (!value) return undefined;
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return undefined;
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12);
}

export function currentMonth(): number {
    return new Date().getMonth() + 1;
}

export function getRecurrenceFormDefaults(
    overrides?: Partial<RecurrenceFormValues>
): RecurrenceFormValues {
    const month = currentMonth();
    return {
        direction: "DEBIT",
        name: "",
        amount: 0,
        frequency: "MONTHLY",
        startDate: toDateString(new Date()) as string,
        hasCustomClosingDate: false,
        dueDay: 10,
        closingDay: 5,
        dueMonth: month,
        closingMonth: month,
        categoryId: null,
        newCategory: null,
        subcategoryId: null,
        newSubcategory: null,
        ...overrides,
    };
}

/** Ajusta os prazos ao trocar de frequência (ex.: semanal usa 0–6, mensal usa 1–31). */
export function applyFrequencyDefaults(
    next: RecurrenceFormFrequency,
    prev: RecurrenceFormFrequency | undefined,
    setValue: UseFormSetValue<RecurrenceFormValues>
) {
    if (next === prev) return;
    if (next === "WEEKLY") {
        setValue("dueDay", 1);
        setValue("closingDay", 1);
        return;
    }
    if (prev === "WEEKLY") {
        setValue("dueDay", 10);
        setValue("closingDay", 5);
    }
    if (next === "YEARLY") {
        setValue("dueMonth", currentMonth());
        setValue("closingMonth", currentMonth());
    }
}

const WEEKDAY_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
export const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;
export const weekdayShort = (day: number) => WEEKDAY_SHORT[day] ?? "—";

export function formatDayMonth(day: number, month: number): string {
    return format(new Date(2024, month - 1, day, 12), "d 'de' MMMM", {
        locale: ptBR,
    });
}

/** Texto legível de vencimento/fechamento conforme a frequência (usado na revisão). */
export function describeDeadlines(data: Partial<RecurrenceFormValues>): {
    due: string;
    closing: string | null;
} {
    const custom = Boolean(data.hasCustomClosingDate);
    const dash = "—";
    switch (data.frequency) {
        case "WEEKLY":
            return {
                due: RECURRENCE_WEEKDAY_LABELS[data.dueDay ?? -1] ?? dash,
                closing: custom
                    ? (RECURRENCE_WEEKDAY_LABELS[data.closingDay ?? -1] ?? dash)
                    : null,
            };
        case "YEARLY":
            return {
                due:
                    data.dueDay && data.dueMonth
                        ? formatDayMonth(data.dueDay, data.dueMonth)
                        : dash,
                closing: custom
                    ? data.closingDay && data.closingMonth
                        ? formatDayMonth(data.closingDay, data.closingMonth)
                        : dash
                    : null,
            };
        default:
            return {
                due: data.dueDay ? `Dia ${data.dueDay}` : dash,
                closing: custom
                    ? data.closingDay
                        ? `Dia ${data.closingDay}`
                        : dash
                    : null,
            };
    }
}
