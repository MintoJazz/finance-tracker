"use client";

import * as React from "react";
import { formatMoney, formatDate } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  WizardReviewCard,
  WizardReviewRow,
  WizardReviewHint,
  type CustomStepProps,
  type WizardStep,
} from "@/components/wizard";
import {
  formatContractDueDay,
  WEEKDAY_LABELS,
  MONTH_NAMES,
} from "@/modules/contracts/ui/formatters/contract-schedule.formatter";
import type { ContractFormValues } from "@/modules/contracts/models/contract-form.schema";

const FREQUENCY_LABELS: Record<string, string> = {
  ONCE: "Pontual",
  WEEKLY: "Semanal",
  MONTHLY: "Mensal",
  YEARLY: "Anual",
};

export function ContractReviewContent({
  data,
}: CustomStepProps<ContractFormValues>) {
  const isPayable = data.type === "PAYABLE";
  const frequencyLabel = data.frequency
    ? FREQUENCY_LABELS[data.frequency] || data.frequency
    : "Mensal";
  const startDateStr = data.validity?.from ? formatDate(data.validity.from) : null;
  const endDateStr = data.validity?.to ? formatDate(data.validity.to) : null;

  const validityText =
    startDateStr && endDateStr
      ? `${startDateStr} a ${endDateStr}`
      : startDateStr
        ? `A partir de ${startDateStr}`
        : "Indeterminado";

  const dueDayFormatted = formatContractDueDay({
    frequency: data.frequency ?? "MONTHLY",
    dueDay: data.schedule?.dueDay ?? 1,
    dueMonth: data.schedule?.dueMonth,
  });

  const getClosingText = () => {
    if (!data.hasCustomClosingDay || !data.schedule?.closingDay) return null;
    const closing = data.schedule.closingDay;
    if (data.frequency === "WEEKLY") {
      const dayName = WEEKDAY_LABELS[closing];
      const targetStr = dayName ? `na ${dayName.toLowerCase()}` : `dia ${closing}`;
      return `· Fecha ${targetStr}`;
    }
    if (data.frequency === "YEARLY") {
      const month = data.schedule.closingMonth;
      const monthName = month ? MONTH_NAMES[month] : null;
      return monthName ? `· Fecha em ${closing} de ${monthName}` : `· Fecha dia ${closing}`;
    }
    return `· Fecha dia ${closing}`;
  };

  const closingText = getClosingText();

  return (
    <div className="space-y-2 py-0.5">
      {/* Card Padronizado de Revisão com Divisórias sem Padding */}
      <WizardReviewCard>
        {/* Linha 1: Natureza & Nome */}
        <WizardReviewRow
          stepId="basics"
          badge={
            <Badge
              variant="outline"
              className={cn(
                "gap-1 font-medium text-[10px] py-0 px-1.5 h-5 shrink-0",
                isPayable
                  ? "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              )}
            >
              {isPayable ? (
                <>
                  <ArrowUpRight className="size-3 text-red-500 shrink-0" />
                  A Pagar
                </>
              ) : (
                <>
                  <ArrowDownLeft className="size-3 text-emerald-500 shrink-0" />
                  A Receber
                </>
              )}
            </Badge>
          }
          value={data.name || "Sem nome"}
        />

        {/* Linha 2: Valor & Recorrência */}
        <WizardReviewRow
          stepId="values"
          value={
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-sm font-mono tabular-nums text-foreground">
                {formatMoney(data.value ?? 0)}
              </span>
              <span className="text-[11px] text-muted-foreground">
                / {frequencyLabel.toLowerCase()}
              </span>
            </div>
          }
        />

        {/* Linha 3: Vencimento & Fechamento */}
        <WizardReviewRow stepId="schedule">
          <div className="flex items-center gap-1.5 text-[11px] min-w-0 text-foreground">
            <span className="font-medium">Vence: {dueDayFormatted}</span>
            {closingText ? (
              <span className="text-muted-foreground">{closingText}</span>
            ) : null}
          </div>
        </WizardReviewRow>

        {/* Linha 4: Vigência */}
        <WizardReviewRow stepId="values">
          <div className="text-[11px] text-muted-foreground min-w-0 truncate">
            <span className="font-medium text-foreground">Vigência: </span>
            {validityText}
          </div>
        </WizardReviewRow>
      </WizardReviewCard>

      <WizardReviewHint>
        O contrato será salvo como ativo nas projeções financeiras.
      </WizardReviewHint>
    </div>
  );
}

export const reviewStep: WizardStep<ContractFormValues> = {
  id: "review",
  title: "Revisão Final",
  submitText: "Confirmar e Salvar",
  component: ContractReviewContent,
};
