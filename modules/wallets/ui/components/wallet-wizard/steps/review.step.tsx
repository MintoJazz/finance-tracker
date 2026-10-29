"use client";

import * as React from "react";
import { Wallet } from "lucide-react";
import {
  WizardReviewCard,
  WizardReviewRow,
  WizardReviewHint,
  type CustomStepProps,
  type WizardStep,
} from "@/components/wizard";
import type { CreateWalletFormValues } from "@/modules/wallets/models/wallet.schema";

export function WalletReviewContent({
  data,
}: CustomStepProps<CreateWalletFormValues>) {
  return (
    <div className="space-y-2.5 py-0.5">
      {/* Card Padronizado de Revisão com Divisórias sem Padding */}
      <WizardReviewCard>
        {/* Linha 1: Nome da Carteira */}
        <WizardReviewRow
          icon={<Wallet className="size-4" />}
          label="Carteira"
          value={data.name || "Sem nome"}
          stepId="basics"
        />

        {/* Linha 2: Tipo da Conta */}
        <WizardReviewRow
          label="Tipo"
          value="Conta / Carteira"
          stepId="basics"
        />
      </WizardReviewCard>

      <WizardReviewHint>
        A carteira será utilizada para organizar e registrar suas movimentações financeiras.
      </WizardReviewHint>
    </div>
  );
}

export const walletReviewStep: WizardStep<CreateWalletFormValues> = {
  id: "review",
  title: "Revisão Final",
  submitText: "Confirmar e Salvar",
  component: WalletReviewContent,
};
