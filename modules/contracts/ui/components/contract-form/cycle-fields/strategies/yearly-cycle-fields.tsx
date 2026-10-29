"use client";

import * as React from "react";
import { FieldLabel, FieldError } from "@/components/ui/field";
import { AnnualDateSelector } from "../annual-date-selector";
import type { CycleFieldProps } from "../types";

export function YearlyCycleFields({
  value,
  onChange,
  hasCustomClosingDay,
  errors,
}: CycleFieldProps) {
  const now = new Date();
  const dueDay = value?.dueDay ?? now.getDate();
  const dueMonth = value?.dueMonth ?? now.getMonth() + 1;
  const closingDay = value?.closingDay ?? null;
  const closingMonth = value?.closingMonth ?? null;

  const handleDueDateChange = (day: number, month: number) => {
    onChange({
      ...value,
      dueDay: day,
      dueMonth: month,
    });
  };

  const handleClosingDateChange = (day: number, month: number) => {
    onChange({
      ...value,
      closingDay: day,
      closingMonth: month,
    });
  };

  // Quando não há fechamento customizado, ocupa 100% da largura. Com fechamento, 2 colunas.
  const containerClass = !hasCustomClosingDay
    ? "w-full"
    : "grid grid-cols-2 gap-3 sm:gap-4 items-start w-full";

  return (
    <div className={containerClass}>
      <div className="flex flex-col gap-1 w-full min-w-0">
        <FieldLabel htmlFor="cycle-due-annual">Data de vencimento (dia e mês)</FieldLabel>
        <AnnualDateSelector
          id="cycle-due-annual"
          day={dueDay}
          month={dueMonth}
          onChange={handleDueDateChange}
          placeholder="Dia e mês"
        />
        {errors?.dueDay && (
          <FieldError errors={[errors.dueDay]} className="text-xs mt-1" />
        )}
      </div>

      {hasCustomClosingDay && (
        <div className="flex flex-col gap-1 w-full min-w-0">
          <FieldLabel htmlFor="cycle-closing-annual">Data de fechamento (dia e mês)</FieldLabel>
          <AnnualDateSelector
            id="cycle-closing-annual"
            day={closingDay}
            month={closingMonth}
            onChange={handleClosingDateChange}
            placeholder="Dia e mês"
          />
          {errors?.closingDay && (
            <FieldError errors={[errors.closingDay]} className="text-xs mt-1" />
          )}
        </div>
      )}
    </div>
  );
}
