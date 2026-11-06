import type { OperationIntentKey } from "../../../models/operation-input.schema"
import { STEP_ORDER } from "../order"
import type { StepDefinition } from "../types"

/**
 * Factory declarativa que gera as 3 etapas do ciclo de criação de categoria/subcategoria
 * (Nome → Cor → Ícone), usada tanto para CREATE_CATEGORY (4010..4030) quanto para CREATE_SUBCATEGORY (4110..4130).
 */
export function buildCategoryCreationSteps<
  TKey extends "CREATE_CATEGORY" | "CREATE_SUBCATEGORY",
>(options: {
  source: TKey
  prefix: "intent.create_category" | "intent.create_subcategory"
  orders: {
    basics: number
    color: number
    icon: number
  }
}) {
  const basicsStep = {
    id: `${options.prefix}.basics`,
    order: options.orders.basics,
    source: options.source,
    fields: [`${options.source}.name`],
  } as const satisfies StepDefinition<OperationIntentKey>

  const colorStep = {
    id: `${options.prefix}.color`,
    order: options.orders.color,
    source: options.source,
    fields: [`${options.source}.color`],
  } as const satisfies StepDefinition<OperationIntentKey>

  const iconStep = {
    id: `${options.prefix}.icon`,
    order: options.orders.icon,
    source: options.source,
    fields: [`${options.source}.icon`],
  } as const satisfies StepDefinition<OperationIntentKey>

  return [basicsStep, colorStep, iconStep] as const
}

export const createCategoryIntentSteps = buildCategoryCreationSteps({
  source: "CREATE_CATEGORY",
  prefix: "intent.create_category",
  orders: {
    basics: STEP_ORDER.CREATE_CATEGORY_BASICS,
    color: STEP_ORDER.CREATE_CATEGORY_COLOR,
    icon: STEP_ORDER.CREATE_CATEGORY_ICON,
  },
})

export const createSubcategoryIntentSteps = buildCategoryCreationSteps({
  source: "CREATE_SUBCATEGORY",
  prefix: "intent.create_subcategory",
  orders: {
    basics: STEP_ORDER.CREATE_SUBCATEGORY_BASICS,
    color: STEP_ORDER.CREATE_SUBCATEGORY_COLOR,
    icon: STEP_ORDER.CREATE_SUBCATEGORY_ICON,
  },
})

