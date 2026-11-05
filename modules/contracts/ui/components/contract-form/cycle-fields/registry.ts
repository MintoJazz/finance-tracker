import type { CycleFieldsRegistry } from "./types";
import { WeeklyCycleFields } from "./strategies/weekly-cycle-fields";
import { MonthlyCycleFields } from "./strategies/monthly-cycle-fields";
import { YearlyCycleFields } from "./strategies/yearly-cycle-fields";

export const cycleFieldsRegistry: CycleFieldsRegistry = {
  ONCE: {
    Component: MonthlyCycleFields,
    getDefaultSchedule: () => ({
      dueDay: 10,
      closingDay: null,
      dueMonth: null,
      closingMonth: null,
    }),
  },
  WEEKLY: {
    Component: WeeklyCycleFields,
    getDefaultSchedule: () => ({
      dueDay: 1, // Segunda-feira
      closingDay: null,
      dueMonth: null,
      closingMonth: null,
    }),
  },
  MONTHLY: {
    Component: MonthlyCycleFields,
    getDefaultSchedule: () => ({
      dueDay: 10,
      closingDay: null,
      dueMonth: null,
      closingMonth: null,
    }),
  },
  YEARLY: {
    Component: YearlyCycleFields,
    getDefaultSchedule: () => {
      const now = new Date();
      return {
        dueDay: now.getDate(),
        dueMonth: now.getMonth() + 1,
        closingDay: null,
        closingMonth: null,
      };
    },
  },
};
