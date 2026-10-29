import * as React from "react";
import { ControlFirstLayout } from "@/components/form";
import { Checkbox } from "@/components/ui/checkbox";
import type { WizardStep } from "@/components/wizard";
import { ContractCycleField } from "../../contract-form/cycle-fields";
import {
  contractScheduleStepSchema,
  type ContractFormValues,
  type ContractScheduleValues,
} from "@/modules/contracts/models/contract-form.schema";

export const scheduleStep: WizardStep<ContractFormValues> = {
  id: "schedule",
  title: "Prazos de Vencimento",
  schema: contractScheduleStepSchema,
  fields: [
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
      name: "schedule",
      children: (_ctx, field) => (
        <ContractCycleField
          value={field.value as ContractScheduleValues | undefined}
          onChange={(val) => field.onChange(val)}
        />
      ),
    },
  ],
};
