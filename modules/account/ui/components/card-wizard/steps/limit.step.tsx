import * as React from "react";
import z from "zod";
import { MoneyInput } from "@/components/form";
import type { WizardStep } from "@/components/wizard";
import {
  CardFormSchema,
  type CardFormValues,
} from "@/modules/account/core/schemas/card.schema";

export const cardLimitStepSchema = z.object({
  limit: CardFormSchema.shape.limit,
});

export const cardLimitStep: WizardStep<CardFormValues> = {
  id: "limit",
  title: "Limite de Crédito",
  schema: cardLimitStepSchema,
  fields: [
    {
      name: "limit",
      label: "Limite total",
      description: "Limite total de crédito concedido para este cartão.",
      children: (
        <MoneyInput
          placeholder="R$ 0,00"
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1.5 text-sm font-semibold shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono tabular-nums"
        />
      ),
    },
  ],
};
