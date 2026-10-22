"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field";
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

  // Na frequência anual, os seletores de dia e mês também ficam lado a lado
  const containerClass = !hasCustomClosingDay
    ? "flex flex-col gap-1.5"
    : "grid grid-cols-2 gap-3 sm:gap-4 items-start";

  return (
    <div className={containerClass}>
      <div className="flex flex-col gap-1.5 min-w-0">
        <Label className="text-xs font-medium text-foreground">
          Data de vencimento (dia e mês)
        </Label>
        <AnnualDateSelector
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
        <div className="flex flex-col gap-1.5 min-w-0">
          <Label className="text-xs font-medium text-foreground">
            Data de fechamento (dia e mês)
          </Label>
          <AnnualDateSelector
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
