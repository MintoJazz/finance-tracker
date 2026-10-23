"use client";

import * as React from "react";
import { FieldLabel, FieldError } from "@/components/ui/field";
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

  // Quando não há fechamento customizado, ocupa 100% da largura. Com fechamento, no desktop 2 colunas e no mobile empilhado.
  const containerClass = !hasCustomClosingDay
    ? "w-full"
    : isDesktop
    ? "grid grid-cols-2 gap-4 items-start w-full"
    : "flex flex-col gap-3.5 items-stretch w-full";

  return (
    <div className={containerClass}>
      <div className="flex flex-col gap-1 w-full min-w-0">
        <FieldLabel htmlFor="cycle-due-weekday">Dia de vencimento</FieldLabel>
        <WeekdaySelector
          id="cycle-due-weekday"
          value={dueDay}
          onChange={handleDueDayChange}
          placeholder="Dia da semana"
        />
        {errors?.dueDay && (
          <FieldError errors={[errors.dueDay]} className="text-xs mt-1" />
        )}
      </div>

      {hasCustomClosingDay && (
        <div className="flex flex-col gap-1 w-full min-w-0">
          <FieldLabel htmlFor="cycle-closing-weekday">Dia de fechamento</FieldLabel>
          <WeekdaySelector
            id="cycle-closing-weekday"
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
