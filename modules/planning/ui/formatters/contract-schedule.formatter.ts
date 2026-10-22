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

export const FREQUENCY_LABELS: Record<string, string> = {
  WEEKLY: "Semanal",
  MONTHLY: "Mensal",
  YEARLY: "Anual",
};

export type ContractFrequencyType = "WEEKLY" | "MONTHLY" | "YEARLY";
export type ExtendedContractFrequency = ContractFrequencyType | (string & {});
export type ScheduleDateInput = Date | string | null;
export type ScheduleMonthInput = number | null;

export interface ContractScheduleFormatInput {
  frequency: ExtendedContractFrequency;
  dueDay: number;
  dueMonth?: ScheduleMonthInput;
  startsAt?: ScheduleDateInput;
}

function formatWeeklyDue(dueDay: number): string {
  const dayName = WEEKDAY_LABELS[dueDay];
  if (!dayName) return `Dia ${dueDay}`;
  const isWeekend = dueDay === 6 || dueDay === 7;
  const prefix = isWeekend ? "Todo" : "Toda";
  return `${prefix} ${dayName.toLowerCase()}`;
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

function formatYearlyDue(dueDay: number, dueMonth?: number | null, startsAt?: Date | string | null): string {
  const month = resolveYearlyMonth(dueMonth, startsAt);
  const monthName = month ? MONTH_NAMES[month] : null;
  return monthName ? `${dueDay} de ${monthName}` : `Dia ${dueDay}`;
}

/**
 * Retorna o texto formatado do vencimento conforme a frequência:
 * - Semanal: dia da semana (ex: "Toda quarta-feira", "Sábado")
 * - Mensal: dia do mês (ex: "Dia 10")
 * - Anual: dia e mês (ex: "15 de Outubro")
 */
export function formatContractDueDay(input: ContractScheduleFormatInput): string {
  const { frequency, dueDay, dueMonth, startsAt } = input;

  if (frequency === "WEEKLY") {
    return formatWeeklyDue(dueDay);
  }

  if (frequency === "YEARLY") {
    return formatYearlyDue(dueDay, dueMonth, startsAt);
  }

  return `Dia ${dueDay}`;
}

/**
 * Retorna o texto combinado (Frequência • Vencimento) para listas e drawers:
 * Ex: "Semanal • Toda quarta-feira", "Mensal • Dia 10", "Anual • 15 de Outubro"
 */
export function formatContractSchedule(input: ContractScheduleFormatInput): string {
  const freqLabel = FREQUENCY_LABELS[input.frequency] || input.frequency;
  const dueLabel = formatContractDueDay(input);
  return `${freqLabel} • ${dueLabel}`;
}
