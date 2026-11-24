"use client";

import * as React from "react";
import { CalendarClock, CreditCard, Sparkles, Tags } from "lucide-react";
import { formatDate, formatMoney } from "@/lib/formatters";
import {
  WizardReviewCard,
  WizardReviewHint,
  WizardReviewRow,
  type CustomStepProps,
  type WizardStep,
} from "@/components/wizard";
import type { InstallmentFormValues } from "@/modules/installments/models/schemas/installment-form.schema";
import type { InstallmentFormOptions } from "@/modules/installments/models/schemas/installment-form-options.schema";
import { describeClassification } from "@/modules/recurrences/ui/utils/recurrence-classification.utils";
import {
  computeInstallmentAmount,
  computeLastInstallmentAmount,
  computeLastInstallmentDate,
} from "@/modules/installments/ui/utils/installment-form.utils";

function NewBadge() {
  return (
    <span className="ml-1 inline-flex items-center gap-0.5 rounded-full border border-primary/30 bg-primary/10 px-1.5 py-px text-[10px] font-medium text-primary align-middle">
      <Sparkles className="size-2.5" />
      nova
    </span>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <span className="text-[11px] text-muted-foreground block font-medium">
        {label}
      </span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}

export function InstallmentReviewContent({
  data,
  options,
}: CustomStepProps<InstallmentFormValues> & { options: InstallmentFormOptions }) {
  const classification = describeClassification(data, options);
  const isInvoice = data.type !== "MONTHLY";
  const card = options.cards.find((c) => c.id === data.cardId);
  const installmentAmount = computeInstallmentAmount(
    data.totalAmount,
    data.totalInstallments
  );
  const lastAmount = computeLastInstallmentAmount(
    data.totalAmount,
    data.totalInstallments
  );
  const lastDate = computeLastInstallmentDate(
    data.purchaseDate,
    data.totalInstallments
  );

  return (
    <div className="space-y-2.5 py-0.5">
      <WizardReviewCard>
        <WizardReviewRow
          icon={
            isInvoice ? (
              <CreditCard className="size-4" />
            ) : (
              <CalendarClock className="size-4" />
            )
          }
          label={isInvoice ? "Fatura do cartão" : "Mês a mês"}
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
          label={`${data.totalInstallments ?? 0}x de`}
          value={
            <span className="text-base font-bold font-mono tabular-nums">
              {formatMoney(installmentAmount)}
            </span>
          }
          stepId="values"
        />

        <WizardReviewRow stepId="values">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <Stat label="Valor total" value={formatMoney(data.totalAmount ?? 0)} />
            <Stat label="Parcelas" value={data.totalInstallments ?? "—"} />
          </div>
        </WizardReviewRow>

        {isInvoice ? (
          <>
            <WizardReviewRow
              icon={<CreditCard className="size-4" />}
              label="Cartão"
              value={card?.name ?? "—"}
              stepId="card"
            />
            <WizardReviewRow
              label="Data da compra"
              value={formatDate(data.purchaseDate) || "—"}
              stepId="payment"
            />
          </>
        ) : (
          <WizardReviewRow stepId="payment">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <Stat
                label="1ª parcela"
                value={formatDate(data.purchaseDate) || "—"}
              />
              <Stat
                label="Última parcela"
                value={(lastDate && formatDate(lastDate)) || "—"}
              />
            </div>
          </WizardReviewRow>
        )}
      </WizardReviewCard>

      <WizardReviewHint>
        As parcelas serão geradas mês a mês a partir da data informada.
        {lastAmount !== installmentAmount && (
          <>
            {" "}
            A última parcela ({formatMoney(lastAmount)}) absorve o resto da
            divisão.
          </>
        )}
      </WizardReviewHint>
    </div>
  );
}

export function createInstallmentReviewStep(
  options: InstallmentFormOptions
): WizardStep<InstallmentFormValues> {
  function Content(props: CustomStepProps<InstallmentFormValues>) {
    return <InstallmentReviewContent {...props} options={options} />;
  }
  return {
    id: "review",
    title: "Revisão Final",
    submitText: "Confirmar e Salvar",
    component: Content,
  };
}
