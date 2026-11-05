import { CalendarRange, CalendarClock, CalendarFold, type LucideIcon } from "lucide-react";
import { formatMoney } from "@/lib/formatters";

export type ContractFrequencyType = "ONCE" | "WEEKLY" | "MONTHLY" | "YEARLY";

export const WEEKDAY_LABELS: Record<number, string> = {
  1: "Segunda-feira",
  2: "Terça-feira",
  3: "Quarta-feira",
  4: "Quinta-feira",
  5: "Sexta-feira",
  6: "Sábado",
  7: "Domingo",
};

export const MONTH_NAMES: Record<number, string> = {
  1: "Janeiro",
  2: "Fevereiro",
  3: "Março",
  4: "Abril",
  5: "Maio",
  6: "Junho",
  7: "Julho",
  8: "Agosto",
  9: "Setembro",
  10: "Outubro",
  11: "Novembro",
  12: "Dezembro",
};

export interface FrequencyScheduleInput {
  dueDay: number;
  dueMonth?: number | null;
  startsAt?: Date | string | null;
}

export interface FrequencyClosingInput {
  closingDay?: number | null;
  closingMonth?: number | null;
}

export interface FrequencyThemeConfig {
  type: ContractFrequencyType;
  label: string;
  adverb: string;
  periodLabel: string;
  pluralPeriodLabel: string;
  recurrenceSuffix: string;
  icon: LucideIcon;
  iconClassName: string;
  badgeClassName: string;
  pillClassName: string;
  formatDueDay: (input: FrequencyScheduleInput) => string;
  formatClosingDay: (input: FrequencyClosingInput) => string | null;
  formatSchedule: (input: FrequencyScheduleInput) => string;
  formatRecurrenceValue: (cents: number) => string;
  formatPeriodCount: (count: number) => string;
}

function resolveYearlyMonth(
  dueMonth?: number | null,
  startsAt?: Date | string | null
): number | null {
  if (dueMonth && dueMonth >= 1 && dueMonth <= 12) {
    return dueMonth;
  }
  if (!startsAt) return null;
  const dateObj = typeof startsAt === "string" ? new Date(startsAt) : startsAt;
  return Number.isNaN(dateObj.getTime()) ? null : dateObj.getMonth() + 1;
}

export const FREQUENCY_THEMES: Record<ContractFrequencyType, FrequencyThemeConfig> = {
  ONCE: {
    type: "ONCE",
    label: "Pontual",
    adverb: "Pontualmente",
    periodLabel: "Único",
    pluralPeriodLabel: "Únicos",
    recurrenceSuffix: "",
    icon: CalendarClock,
    iconClassName: "text-amber-500",
    badgeClassName: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    pillClassName: "border-amber-500/20 bg-amber-500/5 text-amber-600",
    formatDueDay: (input) => `Dia ${input.dueDay}`,
    formatClosingDay: (input) => (input.closingDay ? `Dia ${input.closingDay}` : null),
    formatSchedule: (input) => `Pontual • Dia ${input.dueDay}`,
    formatRecurrenceValue: (cents) => formatMoney(cents),
    formatPeriodCount: (count) => (count === 1 ? "1 ciclo" : `${count} ciclos`),
  },
  WEEKLY: {
    type: "WEEKLY",
    label: "Semanal",
    adverb: "Semanalmente",
    periodLabel: "semana",
    pluralPeriodLabel: "semanas",
    recurrenceSuffix: "/ semana",
    icon: CalendarRange,
    iconClassName: "text-sky-600 dark:text-sky-400 bg-sky-500/10",
    badgeClassName:
      "border-sky-500/30 text-sky-700 dark:text-sky-400 bg-sky-500/10",
    pillClassName: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
    formatDueDay: ({ dueDay }) => {
      const dayName = WEEKDAY_LABELS[dueDay];
      if (!dayName) return `Dia ${dueDay}`;
      const isWeekend = dueDay === 6 || dueDay === 7;
      const prefix = isWeekend ? "Todo" : "Toda";
      return `${prefix} ${dayName.toLowerCase()}`;
    },
    formatClosingDay: ({ closingDay }) => {
      if (!closingDay) return null;
      const dayName = WEEKDAY_LABELS[closingDay];
      if (!dayName) return `Fecha dia ${closingDay}`;
      const isWeekend = closingDay === 6 || closingDay === 7;
      const prefix = isWeekend ? "todo" : "toda";
      return `Fecha ${prefix} ${dayName.toLowerCase()}`;
    },
    formatSchedule: (input) => {
      const dueDayFormatted = FREQUENCY_THEMES.WEEKLY.formatDueDay(input);
      return `Semanal • ${dueDayFormatted}`;
    },
    formatRecurrenceValue: (cents) => `${formatMoney(cents)} / semana`,
    formatPeriodCount: (count) => (count === 1 ? "1 semana" : `${count} semanas`),
  },

  MONTHLY: {
    type: "MONTHLY",
    label: "Mensal",
    adverb: "Mensalmente",
    periodLabel: "mês",
    pluralPeriodLabel: "meses",
    recurrenceSuffix: "/ mês",
    icon: CalendarClock,
    iconClassName: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10",
    badgeClassName:
      "border-indigo-500/30 text-indigo-700 dark:text-indigo-400 bg-indigo-500/10",
    pillClassName: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300",
    formatDueDay: ({ dueDay }) => `Todo dia ${dueDay}`,
    formatClosingDay: ({ closingDay }) => (closingDay ? `Fecha todo dia ${closingDay}` : null),
    formatSchedule: (input) => `Mensal • Todo dia ${input.dueDay}`,
    formatRecurrenceValue: (cents) => `${formatMoney(cents)} / mês`,
    formatPeriodCount: (count) => (count === 1 ? "1 mês" : `${count} meses`),
  },

  YEARLY: {
    type: "YEARLY",
    label: "Anual",
    adverb: "Anualmente",
    periodLabel: "ano",
    pluralPeriodLabel: "anos",
    recurrenceSuffix: "/ ano",
    icon: CalendarFold,
    iconClassName: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
    badgeClassName:
      "border-amber-500/30 text-amber-700 dark:text-amber-400 bg-amber-500/10",
    pillClassName: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    formatDueDay: ({ dueDay, dueMonth, startsAt }) => {
      const month = resolveYearlyMonth(dueMonth, startsAt);
      const monthName = month ? MONTH_NAMES[month] : null;
      return monthName ? `Todo dia ${dueDay} de ${monthName}` : `Todo dia ${dueDay}`;
    },
    formatClosingDay: ({ closingDay, closingMonth }) => {
      if (!closingDay) return null;
      const monthName = closingMonth ? MONTH_NAMES[closingMonth] : null;
      return monthName
        ? `Fecha em ${closingDay} de ${monthName}`
        : `Fecha dia ${closingDay}`;
    },
    formatSchedule: (input) => {
      const month = resolveYearlyMonth(input.dueMonth, input.startsAt);
      const monthName = month ? MONTH_NAMES[month] : null;
      const dateText = monthName ? `${input.dueDay} de ${monthName}` : `Dia ${input.dueDay}`;
      return `Anual • ${dateText}`;
    },
    formatRecurrenceValue: (cents) => `${formatMoney(cents)} / ano`,
    formatPeriodCount: (count) => (count === 1 ? "1 ano" : `${count} anos`),
  },
};

/**
 * Obtém o tema correspondente à frequência com fallback seguro para "MONTHLY".
 */
export function getFrequencyTheme(
  frequency?: ContractFrequencyType | string | null
): FrequencyThemeConfig {
  if (frequency && frequency in FREQUENCY_THEMES) {
    return FREQUENCY_THEMES[frequency as ContractFrequencyType];
  }
  return FREQUENCY_THEMES.MONTHLY;
}

/**
 * Helper global para formatar o dia de vencimento baseado na frequência.
 */
export function formatFrequencyDueDay(
  frequency: ContractFrequencyType | string | null | undefined,
  input: FrequencyScheduleInput
): string {
  const theme = getFrequencyTheme(frequency);
  return theme.formatDueDay(input);
}

/**
 * Helper global para formatar o dia de fechamento baseado na frequência.
 */
export function formatFrequencyClosingDay(
  frequency: ContractFrequencyType | string | null | undefined,
  input: FrequencyClosingInput
): string | null {
  const theme = getFrequencyTheme(frequency);
  return theme.formatClosingDay(input);
}

/**
 * Helper global para formatar o texto completo de agenda (Frequência • Vencimento).
 */
export function formatFrequencySchedule(
  frequency: ContractFrequencyType | string | null | undefined,
  input: FrequencyScheduleInput
): string {
  const theme = getFrequencyTheme(frequency);
  return theme.formatSchedule(input);
}

/**
 * Helper global para formatar o valor com o sufixo da recorrência (ex: "R$ 1.500,00 / mês").
 */
export function formatFrequencyRecurrenceValue(
  cents: number,
  frequency?: ContractFrequencyType | string | null
): string {
  const theme = getFrequencyTheme(frequency);
  return theme.formatRecurrenceValue(cents);
}

export const FREQUENCY_LABELS: Record<ContractFrequencyType, string> = {
  ONCE: FREQUENCY_THEMES.ONCE.label,
  WEEKLY: FREQUENCY_THEMES.WEEKLY.label,
  MONTHLY: FREQUENCY_THEMES.MONTHLY.label,
  YEARLY: FREQUENCY_THEMES.YEARLY.label,
};
