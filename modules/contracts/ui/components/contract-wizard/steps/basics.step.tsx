import * as React from "react";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { WizardStep } from "@/components/wizard";
import {
  contractBasicsStepSchema,
  type ContractFormValues,
} from "@/modules/contracts/models/contract-form.schema";

export const basicsStep: WizardStep<ContractFormValues> = {
  id: "basics",
  title: "Tipo & Nome",
  schema: contractBasicsStepSchema,
  fields: [
    {
      name: "type",
      label: "Natureza do contrato",
      children: (_ctx, field) => (
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <button
            type="button"
            onClick={() => field.onChange("PAYABLE")}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-lg border py-1.5 px-2 text-xs font-medium transition-all cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-ring h-8",
              field.value === "PAYABLE"
                ? "border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400 font-semibold ring-1 ring-red-500/30"
                : "border-border hover:bg-muted text-muted-foreground"
            )}
          >
            <ArrowUpRight className="size-3.5 text-red-500 shrink-0" />
            A Pagar (Despesa)
          </button>
          <button
            type="button"
            onClick={() => field.onChange("RECEIVABLE")}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-lg border py-1.5 px-2 text-xs font-medium transition-all cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-ring h-8",
              field.value === "RECEIVABLE"
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold ring-1 ring-emerald-500/30"
                : "border-border hover:bg-muted text-muted-foreground"
            )}
          >
            <ArrowDownLeft className="size-3.5 text-emerald-500 shrink-0" />
            A Receber (Receita)
          </button>
        </div>
      ),
    },
    {
      name: "name",
      label: "Nome do contrato",
      children: (
        <Input
          placeholder="Ex: Aluguel, Internet..."
          className="h-8.5 text-xs"
        />
      ),
    },
  ],
};
