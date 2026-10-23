"use client";

import * as React from "react";
import { FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { CycleFieldProps } from "../types";

export function MonthlyCycleFields({
  value,
  onChange,
  hasCustomClosingDay,
  errors,
}: CycleFieldProps) {
  const dueDay = value?.dueDay ?? 10;
  const closingDay = value?.closingDay ?? null;

  const handleDueDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange({
      ...value,
      dueDay: val === "" ? 0 : Number(val),
    });
  };

  const handleClosingDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange({
      ...value,
      closingDay: val === "" ? null : Number(val),
    });
  };

  // Quando não há fechamento customizado, ocupa 100% da largura. Com fechamento, 2 colunas.
  const containerClass = !hasCustomClosingDay
    ? "w-full"
    : "grid grid-cols-2 gap-3 sm:gap-4 items-start w-full";

  return (
    <div className={containerClass}>
      <div className="flex flex-col gap-1 w-full min-w-0">
        <FieldLabel htmlFor="cycle-due-day">Dia de vencimento</FieldLabel>
        <Input
          id="cycle-due-day"
          type="number"
          min={1}
          max={31}
          placeholder="Ex: 10"
          value={typeof dueDay === "number" && dueDay > 0 ? dueDay : ""}
          onChange={handleDueDayChange}
          className="font-mono tabular-nums h-9 w-full"
        />
        {errors?.dueDay && (
          <FieldError errors={[errors.dueDay]} className="text-xs mt-1" />
        )}
      </div>

      {hasCustomClosingDay && (
        <div className="flex flex-col gap-1 w-full min-w-0">
          <FieldLabel htmlFor="cycle-closing-day">Dia de fechamento</FieldLabel>
          <Input
            id="cycle-closing-day"
            type="number"
            min={1}
            max={31}
            placeholder="Ex: 5"
            value={typeof closingDay === "number" && closingDay > 0 ? closingDay : ""}
            onChange={handleClosingDayChange}
            className="font-mono tabular-nums h-9 w-full"
          />
          {errors?.closingDay && (
            <FieldError errors={[errors.closingDay]} className="text-xs mt-1" />
          )}
        </div>
      )}
    </div>
  );
}
