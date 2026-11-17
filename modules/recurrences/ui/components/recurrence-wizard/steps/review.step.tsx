"use client";

import * as React from "react";
import { ArrowDownLeft, ArrowUpRight, Sparkles, Tags } from "lucide-react";
import { formatDate, formatMoney } from "@/lib/formatters";
import {
  WizardReviewCard,
  WizardReviewHint,
  WizardReviewRow,
  type CustomStepProps,
  type WizardStep,
} from "@/components/wizard";
import type { RecurrenceFormValues } from "@/modules/recurrences/models/schemas/recurrence-form.schema";
import { RECURRENCE_FORM_FREQUENCY_LABELS } from "@/modules/recurrences/ui/themes/recurrence.themes";
import { describeDeadlines } from "@/modules/recurrences/ui/utils/recurrence-form.utils";
import { describeClassification } from "@/modules/recurrences/ui/utils/recurrence-classification.utils";
import type { RecurrenceCategoryOptions } from "@/modules/recurrences/infra/mock/recurrence-category-options.mock";

function NewBadge() {
  return (
    <span className="ml-1 inline-flex items-center gap-0.5 rounded-full border border-primary/30 bg-primary/10 px-1.5 py-px text-[10px] font-medium text-primary align-middle">
      <Sparkles className="size-2.5" />
      nova
    </span>
  );
}

export function RecurrenceReviewContent({
  data,
  options,
}: CustomStepProps<RecurrenceFormValues> & { options: RecurrenceCategoryOptions }) {
  const classification = describeClassification(data, options);
  const isExpense = data.direction !== "CREDIT";
  const Icon = isExpense ? ArrowUpRight : ArrowDownLeft;
  const deadlines = describeDeadlines(data);

  return (
    <div className="space-y-2.5 py-0.5">
      <WizardReviewCard>
        <WizardReviewRow
          icon={
            <Icon
              className={
                isExpense ? "size-4 text-red-500" : "size-4 text-emerald-500"
              }
            />
          }
          label={isExpense ? "Despesa" : "Receita"}
          value={data.name || "Sem nome"}
          stepId="basics"
        />

        <WizardReviewRow
          icon={<Tags className="size-4" />}
          label="Categoria"
          value={
            <span className="text-sm font-semibold">
              {classification.category ?? "—"}
              {classification.isNewCategory && <NewBadge />}
              <span className="mx-1 text-muted-foreground">›</span>
              {classification.subcategory ?? "—"}
              {classification.isNewSubcategory && <NewBadge />}
            </span>
          }
          stepId="category"
        />

        <WizardReviewRow
          label="Valor recorrente"
          value={
            <span className="text-base font-bold font-mono tabular-nums">
              {formatMoney(data.amount ?? 0)}
            </span>
          }
          stepId="values"
        />

        <WizardReviewRow stepId="values">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[11px] text-muted-foreground block font-medium">
                Frequência
              </span>
              <span className="font-semibold text-foreground">
                {data.frequency
                  ? RECURRENCE_FORM_FREQUENCY_LABELS[data.frequency]
                  : "—"}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground block font-medium">
                Início
              </span>
              <span className="font-semibold text-foreground">
                {formatDate(data.startDate) || "—"}
              </span>
            </div>
          </div>
        </WizardReviewRow>

        <WizardReviewRow stepId="deadlines">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[11px] text-muted-foreground block font-medium">
                Vencimento
              </span>
              <span className="font-semibold text-foreground">
                {deadlines.due}
              </span>
            </div>
            {deadlines.closing && (
              <div>
                <span className="text-[11px] text-muted-foreground block font-medium">
                  Fechamento
                </span>
                <span className="font-semibold text-foreground">
                  {deadlines.closing}
                </span>
              </div>
            )}
          </div>
        </WizardReviewRow>
      </WizardReviewCard>

      <WizardReviewHint>
        A recorrência gerará previsões automáticas conforme a frequência
        escolhida.
      </WizardReviewHint>
    </div>
  );
}

export function createRecurrenceReviewStep(
  options: RecurrenceCategoryOptions
): WizardStep<RecurrenceFormValues> {
  function Content(props: CustomStepProps<RecurrenceFormValues>) {
    return <RecurrenceReviewContent {...props} options={options} />;
  }
  return {
    id: "review",
    title: "Revisão Final",
    submitText: "Confirmar e Salvar",
    component: Content,
  };
}
