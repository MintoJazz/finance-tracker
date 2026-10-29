"use client";

import * as React from "react";
import { CreditCard } from "lucide-react";
import { formatMoney } from "@/lib/formatters";
import {
  WizardReviewCard,
  WizardReviewRow,
  WizardReviewHint,
  type CustomStepProps,
  type WizardStep,
} from "@/components/wizard";
import type { CardFormValues } from "@/modules/cards/models/card.schema";

export function CardReviewContent({
  data,
}: CustomStepProps<CardFormValues>) {
  return (
    <div className="space-y-2.5 py-0.5">
      {/* Card Visual de Apresentação e Revisão com Divisórias sem Padding */}
      <WizardReviewCard>
        {/* Linha 1: Nome do Cartão */}
        <WizardReviewRow
          icon={<CreditCard className="size-4" />}
          label="Cartão"
          value={data.name || "Sem nome"}
          stepId="basics"
        />

        {/* Linha 2: Limite Total */}
        <WizardReviewRow
          label="Limite Total"
          value={
            <span className="text-base font-bold font-mono tabular-nums">
              {formatMoney(data.limit ?? 0)}
            </span>
          }
          stepId="limit"
        />

        {/* Linha 3: Ciclo da Fatura (Fechamento e Vencimento) */}
        <WizardReviewRow stepId="cycle">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[11px] text-muted-foreground block font-medium">
                Fechamento
              </span>
              <span className="font-semibold text-foreground">
                Dia {data.closingDay ?? 1}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground block font-medium">
                Vencimento
              </span>
              <span className="font-semibold text-foreground">
                Dia {data.dueDay ?? 10}
              </span>
            </div>
          </div>
        </WizardReviewRow>
      </WizardReviewCard>

      <WizardReviewHint>
        O cartão ficará disponível para lançamentos e controle de limites.
      </WizardReviewHint>
    </div>
  );
}

export const cardReviewStep: WizardStep<CardFormValues> = {
  id: "review",
  title: "Revisão Final",
  submitText: "Confirmar e Salvar",
  component: CardReviewContent,
};
