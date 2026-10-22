import type { FieldErrors } from "react-hook-form";
import type { ContractScheduleValues, ContractFrequencyEnum } from "@/modules/planning/core/schemas/contract-form.schema";

export interface CycleFieldProps {
  value: ContractScheduleValues;
  onChange: (value: ContractScheduleValues) => void;
  hasCustomClosingDay: boolean;
  isDesktop: boolean;
  errors?: FieldErrors<ContractScheduleValues>;
}

export interface CycleFieldStrategy {
  Component: React.ComponentType<CycleFieldProps>;
  getDefaultSchedule: () => ContractScheduleValues;
}

export type CycleFieldsRegistry = Record<ContractFrequencyEnum, CycleFieldStrategy>;
