import * as React from "react";
import z from "zod";
import { Input } from "@/components/ui/input";
import type { WizardStep } from "@/components/wizard";
import {
  CardFormSchema,
  type CardFormValues,
} from "@/modules/cards/models/card.schema";

export const cardBasicsStepSchema = z.object({
  name: CardFormSchema.shape.name,
});

export const cardBasicsStep: WizardStep<CardFormValues> = {
  id: "basics",
  title: "Nome do Cartão",
  schema: cardBasicsStepSchema,
  fields: [
    {
      name: "name",
      label: "Nome de identificação",
      description: "Ex: Nubank Ultravioleta, Inter Black, Itaú Azul...",
      children: (
        <Input
          placeholder="Digite o nome do cartão"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          data-1p-ignore="true"
          data-lpignore="true"
          className="h-9 text-sm"
        />
      ),
    },
  ],
};
