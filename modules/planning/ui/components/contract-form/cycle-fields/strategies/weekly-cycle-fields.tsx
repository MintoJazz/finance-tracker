"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field";
import { WeekdaySelector } from "../weekday-selector";
import type { CycleFieldProps } from "../types";

export function WeeklyCycleFields({
  value,
  onChange,
  hasCustomClosingDay,
  isDesktop,
  errors,
}: CycleFieldProps) {
  const dueDay = value?.dueDay ?? 1;
  const closingDay = value?.closingDay ?? null;

  const handleDueDayChange = (newDueDay: number) => {
    onChange({
      ...value,
      dueDay: newDueDay,
    });
  };

  const handleClosingDayChange = (newClosingDay: number) => {
    onChange({
      ...value,
      closingDay: newClosingDay,
    });
  };

  // Na frequência semanal, no desktop fica lado a lado (grid-cols-2) e no mobile empilhado (flex-col)
  const containerClass = !hasCustomClosingDay
    ? "flex flex-col gap-1.5"
    : isDesktop
    ? "grid grid-cols-2 gap-4 items-start"
    : "flex flex-col gap-3.5 items-stretch";

  return (
    <div className={containerClass}>
      <div className="flex flex-col gap-1.5 min-w-0">
        <Label className="text-xs font-medium text-foreground">
          Dia de vencimento
        </Label>
        <WeekdaySelector
          value={dueDay}
          onChange={handleDueDayChange}
          placeholder="Dia da semana"
        />
        {errors?.dueDay && (
          <FieldError errors={[errors.dueDay]} className="text-xs mt-1" />
        )}
      </div>

      {hasCustomClosingDay && (
        <div className="flex flex-col gap-1.5 min-w-0">
          <Label className="text-xs font-medium text-foreground">
            Dia de fechamento
          </Label>
          <WeekdaySelector
            value={closingDay}
            onChange={handleClosingDayChange}
            placeholder="Dia de fechamento"
          />
          {errors?.closingDay && (
            <FieldError errors={[errors.closingDay]} className="text-xs mt-1" />
          )}
        </div>
      )}
    </div>
  );
}
