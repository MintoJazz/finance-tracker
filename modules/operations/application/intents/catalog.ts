import type { OperationIntentKey } from "../../models/operation-input.schema"
import { BASE_STEPS } from "../steps/base"
import type { OperationStepCatalog } from "../steps/interpreter"
import { createCategoryIntent } from "./create-category.intent"
import { createSubcategoryIntent } from "./create-subcategory.intent"
import { installmentsIntent } from "./installments.intent"
import { reimbursementIntent } from "./reimbursement.intent"
import { settleCommitmentIntent } from "./settle-commitment.intent"
import { splitGroupIntent } from "./split-group.intent"

export const OPERATION_INTENTS = {
  CREATE_CATEGORY: createCategoryIntent,
  CREATE_SUBCATEGORY: createSubcategoryIntent,
  DEMO_SETTLE: settleCommitmentIntent,
  DEMO_INSTALLMENTS: installmentsIntent,
  DEMO_REIMBURSEMENT: reimbursementIntent,
  DEMO_SPLIT_GROUP: splitGroupIntent,
} as const

export const OPERATION_STEP_CATALOG: OperationStepCatalog<OperationIntentKey> = {
  base: BASE_STEPS,
  intents: OPERATION_INTENTS,
}

/**
 * Catálogo mínimo apenas com as etapas base e as intenções de criação de categoria/subcategoria.
 */
export const BASE_ONLY_OPERATION_CATALOG: OperationStepCatalog<OperationIntentKey> =
  {
    base: BASE_STEPS,
    intents: {
      CREATE_CATEGORY: createCategoryIntent,
      CREATE_SUBCATEGORY: createSubcategoryIntent,
    },
  }
