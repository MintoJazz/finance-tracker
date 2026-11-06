"use client"

import * as React from "react"
import { z } from "zod"
import type { WizardStep } from "@/components/wizard"
import { CreateCategoryIntentSliceSchema } from "@/modules/operations/models/intents/create-category.schema"
import type { OperationDraft } from "@/modules/operations/models/operation-input.schema"
import type { StepViews } from "@/modules/operations/ui/components/operation-wizard/types"
import { CategoryCreationColorField } from "./color-field"
import { CategoryCreationDesktopForm } from "./desktop-form"
import { CategoryCreationIconField } from "./icon-field"
import { CategoryCreationNameField } from "./name-field"

export function buildCategoryCreationStepViews(options: {
  sliceKey: "CREATE_CATEGORY" | "CREATE_SUBCATEGORY"
  prefix: "intent.create_category" | "intent.create_subcategory"
  entityLabel: "Categoria" | "Subcategoria"
}) {
  const { sliceKey, prefix, entityLabel } = options
  const basicsId = `${prefix}.basics` as const
  const colorId = `${prefix}.color` as const
  const iconId = `${prefix}.icon` as const

  const basicsSchema = z.object({
    [sliceKey]: z.object({
      name: CreateCategoryIntentSliceSchema.shape.name,
    }),
  })

  const colorSchema = z.object({
    [sliceKey]: z.object({
      color: CreateCategoryIntentSliceSchema.shape.color,
    }),
  })

  const iconSchema = z.object({
    [sliceKey]: z.object({
      icon: CreateCategoryIntentSliceSchema.shape.icon,
    }),
  })

  const desktopUnifiedSchema = z.object({
    [sliceKey]: CreateCategoryIntentSliceSchema,
  })

  const buildDesktopUnifiedStep = (): WizardStep<OperationDraft> => ({
    id: basicsId,
    title: `Nova ${entityLabel}`,
    description:
      entityLabel === "Subcategoria"
        ? "Defina o nome, cor e ícone da subcategoria."
        : "Defina o nome, cor e ícone da nova categoria.",
    schema: desktopUnifiedSchema as any,
    component: () => (
      <CategoryCreationDesktopForm
        sliceKey={sliceKey}
        entityLabel={entityLabel}
      />
    ),
  })

  const buildBasicsStep = (): WizardStep<OperationDraft> => ({
    id: basicsId,
    title: `Nome da Nova ${entityLabel}`,
    description: `Defina o nome da ${entityLabel.toLowerCase()} que será criada junto com esta operação.`,
    schema: basicsSchema as any,
    fields: [
      {
        name: `${sliceKey}.name`,
        label: `Nome da ${entityLabel.toLowerCase()}`,
        children: (_ctx, field) => (
          <CategoryCreationNameField
            sliceKey={sliceKey}
            stepId={basicsId}
            value={field.value as string | undefined}
            onChange={(val) => field.onChange(val)}
            placeholder={
              entityLabel === "Subcategoria"
                ? "Ex: Padaria, Feira, Streaming..."
                : "Ex: Alimentação, Lazer, Saúde..."
            }
          />
        ),
      },
    ],
  })

  const buildColorStep = (
    variant: "carousel" | "grid"
  ): WizardStep<OperationDraft> => ({
    id: colorId,
    title: `Cor da Nova ${entityLabel}`,
    description: "Escolha uma cor de destaque.",
    schema: colorSchema as any,
    fields: [
      {
        name: `${sliceKey}.color`,
        label: "Cor de identificação",
        children: (_ctx, field) => (
          <CategoryCreationColorField
            sliceKey={sliceKey}
            stepId={colorId}
            value={field.value as string | null | undefined}
            onChange={(val) => field.onChange(val)}
            variant={variant}
          />
        ),
      },
    ],
  })

  const buildIconStep = (
    variant: "carousel" | "grid"
  ): WizardStep<OperationDraft> => ({
    id: iconId,
    title: `Ícone da Nova ${entityLabel}`,
    description:
      entityLabel === "Categoria"
        ? "Escolha um ícone ou adicione também uma nova subcategoria abaixo."
        : "Escolha um ícone para identificar a nova subcategoria.",
    schema: iconSchema as any,
    fields: [
      {
        name: `${sliceKey}.icon`,
        label: "Ícone",
        children: (_ctx, field) => (
          <CategoryCreationIconField
            sliceKey={sliceKey}
            stepId={iconId}
            value={field.value as string | null | undefined}
            onChange={(val) => field.onChange(val)}
            variant={variant}
          />
        ),
      },
    ],
  })

  return {
    [basicsId]: {
      desktop: buildDesktopUnifiedStep(),
      mobile: [buildBasicsStep()],
    } satisfies StepViews<OperationDraft>,
    [colorId]: {
      desktop: null,
      mobile: [buildColorStep("carousel")],
    } satisfies StepViews<OperationDraft>,
    [iconId]: {
      desktop: null,
      mobile: [buildIconStep("carousel")],
    } satisfies StepViews<OperationDraft>,
  }
}

export const createCategoryStepViewsMap = buildCategoryCreationStepViews({
  sliceKey: "CREATE_CATEGORY",
  prefix: "intent.create_category",
  entityLabel: "Categoria",
})

export const createSubcategoryStepViewsMap = buildCategoryCreationStepViews({
  sliceKey: "CREATE_SUBCATEGORY",
  prefix: "intent.create_subcategory",
  entityLabel: "Subcategoria",
})
