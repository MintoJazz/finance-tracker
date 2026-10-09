import * as React from "react";
import { MoneyInput } from "@/components/form";
import { DateRangePicker } from "@/components/form/date-picker/date-range";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";
import type { WizardStep } from "@/components/wizard";
import {
  contractValuesStepSchema,
  type ContractFormValues,
} from "../../../../core/schemas/contract-form.schema";

const FREQUENCY_OPTIONS = [
  { value: "WEEKLY", label: "Semanal" },
  { value: "MONTHLY", label: "Mensal" },
  { value: "YEARLY", label: "Anual" },
] as const;

export const valuesStep: WizardStep<ContractFormValues> = {
  id: "values",
  title: "Valores & Período",
  schema: contractValuesStepSchema,
  fields: [
    {
      name: "value",
      label: "Valor recorrente",
      children: (
        <MoneyInput
          placeholder="R$ 0,00"
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1.5 text-sm font-semibold shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono tabular-nums"
        />
      ),
    },
    {
      name: "frequency",
      label: "Frequência",
      children: (_ctx, field) => (
        <div className="grid grid-cols-3 gap-1.5 pt-0.5">
          {FREQUENCY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => field.onChange(opt.value)}
              className={cn(
                "rounded-md border py-1.5 px-2 text-xs font-medium transition-all cursor-pointer text-center outline-none focus-visible:ring-1 focus-visible:ring-ring h-8",
                field.value === opt.value
                  ? "border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary/20"
                  : "border-border hover:bg-muted text-muted-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      ),
    },
    {
      name: "validity",
      label: "Período de vigência (opcional)",
      children: (_ctx, field) => (
        <DateRangePicker
          value={field.value as DateRange | undefined}
          onChange={(range) => field.onChange(range)}
          placeholder="Início e término..."
          className="h-8.5 text-xs"
        />
      ),
    },
  ],
};
