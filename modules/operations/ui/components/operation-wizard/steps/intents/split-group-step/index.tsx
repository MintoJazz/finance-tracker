"use client"

import * as React from "react"
import { z } from "zod"
import type { WizardStep } from "@/components/wizard"
import {
  SplitGroupModeSchema,
  type SplitGroupMode,
} from "@/modules/operations/models/intents/split-group.schema"
import type { OperationDraft } from "@/modules/operations/models/operation-input.schema"
import type { StepViews } from "@/modules/operations/ui/components/operation-wizard/types"
import { GroupSharesEditor } from "./group-shares-editor"

const splitGroupStepSchema = z.object({
  DEMO_SPLIT_GROUP: z.object({
    mode: SplitGroupModeSchema.default("EQUAL"),
  }),
})

export const splitGroupWizardStep: WizardStep<OperationDraft> = {
  id: "intent.split_group.shares",
  title: "Rateio do Grupo",
  description:
    "Defina como o valor será distribuído entre os integrantes do grupo selecionado.",
  schema: splitGroupStepSchema as any,
  fields: [
    {
      name: "DEMO_SPLIT_GROUP.mode",
      label: "Regra de divisão",
      children: (_ctx, field) => (
        <GroupSharesEditor
          mode={(field.value as SplitGroupMode | undefined) ?? "EQUAL"}
          onChangeMode={(mode) => field.onChange(mode)}
        />
      ),
    },
  ],
}

export const splitGroupStepViews = {
  desktop: splitGroupWizardStep,
  mobile: [splitGroupWizardStep],
} satisfies StepViews<OperationDraft>
