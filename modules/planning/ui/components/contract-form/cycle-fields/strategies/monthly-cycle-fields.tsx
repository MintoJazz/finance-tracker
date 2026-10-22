"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/ui/field";
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

  // Na frequência mensal, ambos os campos ficam lado a lado no desktop e no mobile
  const containerClass = !hasCustomClosingDay
    ? "flex flex-col gap-1.5"
    : "grid grid-cols-2 gap-3 sm:gap-4 items-start";

  return (
    <div className={containerClass}>
      <div className="flex flex-col gap-1.5 min-w-0">
        <Label className="text-xs font-medium text-foreground">
          Dia de vencimento
        </Label>
        <Input
          type="number"
          min={1}
          max={31}
          placeholder="Ex: 10"
          value={typeof dueDay === "number" && dueDay > 0 ? dueDay : ""}
          onChange={handleDueDayChange}
          className="font-mono tabular-nums h-9"
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
          <Input
            type="number"
            min={1}
            max={31}
            placeholder="Ex: 5"
            value={typeof closingDay === "number" && closingDay > 0 ? closingDay : ""}
            onChange={handleClosingDayChange}
            className="font-mono tabular-nums h-9"
          />
          {errors?.closingDay && (
            <FieldError errors={[errors.closingDay]} className="text-xs mt-1" />
          )}
        </div>
      )}
    </div>
  );
}
