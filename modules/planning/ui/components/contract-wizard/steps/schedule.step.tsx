import * as React from "react";
import { ControlFirstLayout } from "@/components/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import type { WizardStep } from "@/components/wizard";
import {
  contractScheduleStepSchema,
  type ContractFormValues,
} from "../../../../core/schemas/contract-form.schema";

export const scheduleStep: WizardStep<ContractFormValues> = {
  id: "schedule",
  title: "Prazos de Vencimento",
  schema: contractScheduleStepSchema,
  fields: [
    {
      name: "dueDay",
      label: "Dia de vencimento (1 a 31)",
      children: (_ctx, field) => (
        <Input
          type="number"
          min={1}
          max={31}
          placeholder="Ex: 10"
          value={field.value ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            field.onChange(val === "" ? 0 : Number(val));
          }}
          className="h-8.5 text-xs font-mono tabular-nums"
        />
      ),
    },
    {
      name: "hasCustomClosingDay",
      label: "Data de fechamento diferente do vencimento",
      layout: ControlFirstLayout,
      children: (_ctx, field) => (
        <Checkbox
          checked={Boolean(field.value)}
          onCheckedChange={(checked) => field.onChange(Boolean(checked))}
        />
      ),
    },
    {
      name: "closingDay",
      label: "Dia de fechamento (1 a 31)",
      hidden: (values) => !values?.hasCustomClosingDay,
      children: (_ctx, field) => (
        <Input
          type="number"
          min={1}
          max={31}
          placeholder="Ex: 5"
          value={field.value ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            field.onChange(val === "" ? null : Number(val));
          }}
          className="h-8.5 text-xs font-mono tabular-nums"
        />
      ),
    },
  ],
};
