"use client"

import * as React from "react"
import { z } from "zod"
import type { WizardStep } from "@/components/wizard"
import { ObligationSliceSchema } from "@/modules/operations/models/intents/obligation.schema"
import type { OperationDraft } from "@/modules/operations/models/operation-input.schema"
import type { StepViews } from "@/modules/operations/ui/components/operation-wizard/types"
import { ContractPicker } from "./contract-picker"
import { CyclePanel } from "./cycle-panel"

function buildContractStep(
  intentKey: "SETTLE_PAYABLE" | "SETTLE_RECEIVABLE",
  variant: "carousel" | "grid"
): WizardStep<OperationDraft> {
  const isPay = intentKey === "SETTLE_PAYABLE"
  return {
    id: `intent.${intentKey.toLowerCase()}.contract`,
    title: isPay ? "Compromisso ou Cartão" : "Cobrança a Receber",
    description: isPay
      ? "Selecione o compromisso cujos ciclos serão quitados."
      : "Selecione a cobrança cujos ciclos serão recebidos.",
    schema: z.object({
      [intentKey]: z.object({
        agreementId: ObligationSliceSchema.shape.agreementId,
      }),
    }),
    fields: [
      {
        name: `${intentKey}.agreementId`,
        children: (_ctx, field) => (
          <ContractPicker
            value={field.value as number | undefined}
            onChange={(val) => field.onChange(val)}
            variant={variant}
          />
        ),
      },
    ],
  }
}

function buildCyclesStep(
  intentKey: "SETTLE_PAYABLE" | "SETTLE_RECEIVABLE",
  viewport: "desktop" | "mobile"
): WizardStep<OperationDraft> {
  const isPay = intentKey === "SETTLE_PAYABLE"
  return {
    id: `intent.${intentKey.toLowerCase()}.cycles`,
    title: isPay ? "Ciclos do Compromisso" : "Ciclos da Cobrança",
    description: isPay
      ? "Marque os ciclos que deseja quitar nesta operação."
      : "Marque os ciclos que deseja receber nesta operação.",
    schema: z.object({
      [intentKey]: z.object({
        allocations: ObligationSliceSchema.shape.allocations,
      }),
    }),
    fields: [
      {
        name: `${intentKey}.allocations`,
        children: (_ctx, field) => (
          <CyclePanel
            value={
              field.value as
                | {
                    referenceDate: string
                    amount: number
                    status?: import("@/modules/cycles/models/obligation-cycle.schema").CycleStatus
                  }[]
                | undefined
            }
            onChange={(val) => field.onChange(val)}
            viewport={viewport}
          />
        ),
      },
    ],
  }
}

export const settlePayableContractStepViews: StepViews<OperationDraft> = {
  desktop: buildContractStep("SETTLE_PAYABLE", "grid"),
  mobile: [buildContractStep("SETTLE_PAYABLE", "carousel")],
}

export const settlePayableCyclesStepViews: StepViews<OperationDraft> = {
  desktop: buildCyclesStep("SETTLE_PAYABLE", "desktop"),
  mobile: [buildCyclesStep("SETTLE_PAYABLE", "mobile")],
}

export const settleReceivableContractStepViews: StepViews<OperationDraft> = {
  desktop: buildContractStep("SETTLE_RECEIVABLE", "grid"),
  mobile: [buildContractStep("SETTLE_RECEIVABLE", "carousel")],
}

export const settleReceivableCyclesStepViews: StepViews<OperationDraft> = {
  desktop: buildCyclesStep("SETTLE_RECEIVABLE", "desktop"),
  mobile: [buildCyclesStep("SETTLE_RECEIVABLE", "mobile")],
}

export const obligationStepViewsMap: Record<string, StepViews<OperationDraft>> = {
  "intent.settle_payable.contract": settlePayableContractStepViews,
  "intent.settle_payable.cycles": settlePayableCyclesStepViews,
  "intent.settle_receivable.contract": settleReceivableContractStepViews,
  "intent.settle_receivable.cycles": settleReceivableCyclesStepViews,
}

