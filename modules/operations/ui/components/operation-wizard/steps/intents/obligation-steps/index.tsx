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
  intentKey: "PAY_OBLIGATION" | "RECEIVE_OBLIGATION",
  variant: "carousel" | "grid"
): WizardStep<OperationDraft> {
  const isPay = intentKey === "PAY_OBLIGATION"
  return {
    id: `intent.${intentKey.toLowerCase()}.contract`,
    title: isPay ? "Contrato ou Cartão" : "Contrato a Receber",
    description: "Selecione o compromisso cujos ciclos serão liquidados.",
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
  intentKey: "PAY_OBLIGATION" | "RECEIVE_OBLIGATION",
  viewport: "desktop" | "mobile"
): WizardStep<OperationDraft> {
  return {
    id: `intent.${intentKey.toLowerCase()}.cycles`,
    title: "Ciclos da Obrigação",
    description: "Marque os ciclos que deseja liquidar nesta operação.",
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

export const payObligationContractStepViews: StepViews<OperationDraft> = {
  desktop: buildContractStep("PAY_OBLIGATION", "grid"),
  mobile: [buildContractStep("PAY_OBLIGATION", "carousel")],
}

export const payObligationCyclesStepViews: StepViews<OperationDraft> = {
  desktop: buildCyclesStep("PAY_OBLIGATION", "desktop"),
  mobile: [buildCyclesStep("PAY_OBLIGATION", "mobile")],
}

export const receiveObligationContractStepViews: StepViews<OperationDraft> = {
  desktop: buildContractStep("RECEIVE_OBLIGATION", "grid"),
  mobile: [buildContractStep("RECEIVE_OBLIGATION", "carousel")],
}

export const receiveObligationCyclesStepViews: StepViews<OperationDraft> = {
  desktop: buildCyclesStep("RECEIVE_OBLIGATION", "desktop"),
  mobile: [buildCyclesStep("RECEIVE_OBLIGATION", "mobile")],
}

export const obligationStepViewsMap: Record<string, StepViews<OperationDraft>> = {
  "intent.pay_obligation.contract": payObligationContractStepViews,
  "intent.pay_obligation.cycles": payObligationCyclesStepViews,
  "intent.receive_obligation.contract": receiveObligationContractStepViews,
  "intent.receive_obligation.cycles": receiveObligationCyclesStepViews,
}

