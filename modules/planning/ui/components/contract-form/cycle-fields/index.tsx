"use client";

import * as React from "react";
import { useFormContext, useWatch, type FieldErrors } from "react-hook-form";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import type {
  ContractFormValues,
  ContractScheduleValues,
  ContractFrequencyEnum,
} from "@/modules/planning/core/schemas/contract-form.schema";
import { cycleFieldsRegistry } from "./registry";

export interface ContractCycleFieldProps {
  value?: ContractScheduleValues | null;
  onChange: (value: ContractScheduleValues) => void;
  className?: string;
}

export function ContractCycleField({
  value,
  onChange,
  className,
}: ContractCycleFieldProps) {
  const { formState: { errors } } = useFormContext<ContractFormValues>();
  const frequency = useWatch<ContractFormValues, "frequency">({
    name: "frequency",
  }) as ContractFrequencyEnum | undefined ?? "MONTHLY";

  const hasCustomClosingDay = Boolean(
    useWatch<ContractFormValues, "hasCustomClosingDay">({
      name: "hasCustomClosingDay",
    })
  );

  const isDesktop = useIsDesktop();

  const strategy = cycleFieldsRegistry[frequency] ?? cycleFieldsRegistry.MONTHLY;
  const CycleComponent = strategy.Component;

  // Garante que o valor inicial contenha campos mínimos esperados
  const safeValue: ContractScheduleValues = React.useMemo(() => {
    const defaults = strategy.getDefaultSchedule();
    return {
      dueDay: value?.dueDay ?? defaults.dueDay,
      closingDay: value?.closingDay ?? defaults.closingDay,
      dueMonth: value?.dueMonth ?? defaults.dueMonth,
      closingMonth: value?.closingMonth ?? defaults.closingMonth,
    };
  }, [value, strategy]);

  return (
    <div className={className}>
      <CycleComponent
        value={safeValue}
        onChange={onChange}
        hasCustomClosingDay={hasCustomClosingDay}
        isDesktop={isDesktop}
        errors={errors?.schedule as FieldErrors<ContractScheduleValues> | undefined}
      />
    </div>
  );
}

export * from "./registry";
export * from "./types";
export * from "./weekday-selector";
export * from "./annual-date-selector";
