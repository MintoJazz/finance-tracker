import {
  WEEKDAY_LABELS,
  MONTH_NAMES,
  FREQUENCY_LABELS,
  type ContractFrequencyType,
  type FrequencyScheduleInput,
  type FrequencyClosingInput,
  getFrequencyTheme,
  formatFrequencyDueDay,
  formatFrequencyClosingDay,
  formatFrequencySchedule,
  formatFrequencyRecurrenceValue,
} from "../themes/frequency-type.theme";

export {
  WEEKDAY_LABELS,
  MONTH_NAMES,
  FREQUENCY_LABELS,
  type ContractFrequencyType,
  getFrequencyTheme,
  formatFrequencyDueDay,
  formatFrequencyClosingDay,
  formatFrequencySchedule,
  formatFrequencyRecurrenceValue,
};

export type ExtendedContractFrequency = ContractFrequencyType | (string & {});
export type ScheduleDateInput = Date | string | null;
export type ScheduleMonthInput = number | null;

export interface ContractScheduleFormatInput {
  frequency: ExtendedContractFrequency;
  dueDay: number;
  dueMonth?: ScheduleMonthInput;
  startsAt?: ScheduleDateInput;
}

export interface ContractClosingFormatInput {
  frequency?: ExtendedContractFrequency;
  closingDay?: number | null;
  closingMonth?: number | null;
}

/**
 * Retorna o texto formatado do vencimento conforme a frequência:
 * Delega para o registry de temas de frequência.
 * - Semanal: dia da semana (ex: "Toda quarta-feira", "Todo sábado")
 * - Mensal: dia do mês (ex: "Todo dia 10")
 * - Anual: dia e mês (ex: "Todo dia 15 de Outubro")
 */
export function formatContractDueDay(input: ContractScheduleFormatInput): string {
  return formatFrequencyDueDay(input.frequency as ContractFrequencyType, {
    dueDay: input.dueDay,
    dueMonth: input.dueMonth,
    startsAt: input.startsAt,
  });
}

/**
 * Retorna o texto formatado do dia de fechamento conforme a frequência:
 * Delega para o registry de temas de frequência.
 */
export function formatContractClosingDay(input: ContractClosingFormatInput): string | null {
  return formatFrequencyClosingDay(input.frequency as ContractFrequencyType, {
    closingDay: input.closingDay,
    closingMonth: input.closingMonth,
  });
}

/**
 * Retorna o texto combinado (Frequência • Vencimento) para listas e drawers:
 * Ex: "Semanal • Toda quarta-feira", "Mensal • Todo dia 10", "Anual • 15 de Outubro"
 */
export function formatContractSchedule(input: ContractScheduleFormatInput): string {
  return formatFrequencySchedule(input.frequency as ContractFrequencyType, {
    dueDay: input.dueDay,
    dueMonth: input.dueMonth,
    startsAt: input.startsAt,
  });
}
