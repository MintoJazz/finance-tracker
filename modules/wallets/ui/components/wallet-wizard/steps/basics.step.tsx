import * as React from "react";
import z from "zod";
import { Input } from "@/components/ui/input";
import type { WizardStep } from "@/components/wizard";
import {
  CreateWalletSchema,
  type CreateWalletFormValues,
} from "@/modules/wallets/models/wallet.schema";

export const walletBasicsStepSchema = z.object({
  name: CreateWalletSchema.shape.name,
});

export const walletBasicsStep: WizardStep<CreateWalletFormValues> = {
  id: "basics",
  title: "Nome da Carteira",
  schema: walletBasicsStepSchema,
  fields: [
    {
      name: "name",
      label: "Nome de identificação",
      description: "Ex: Carteira Principal, Dinheiro, Reserva de Emergência...",
      children: (
        <Input
          placeholder="Digite o nome da carteira"
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
