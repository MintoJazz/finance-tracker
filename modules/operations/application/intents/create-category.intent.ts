import { CreateCategoryIntentSliceSchema } from "../../models/intents/create-category.schema"
import type { OperationIntentKey } from "../../models/operation-input.schema"
import { createCategoryIntentSteps } from "../steps/intents/create-category.steps"
import { createCategorySummary } from "./summaries/create-category.summary"
import type { IntentDefinition } from "./types"

export const createCategoryIntent = {
  key: "CREATE_CATEGORY",
  schema: CreateCategoryIntentSliceSchema,
  addSteps: createCategoryIntentSteps,
  removeSteps: ["base.category", "base.subcategory"],
  excludes: ["DEMO_SETTLE"],
  requires: [],
  implies: ["CREATE_SUBCATEGORY"],
  offer: {
    at: [
      "base.category",
      "intent.create_category.basics",
      "intent.create_category.color",
      "intent.create_category.icon",
    ],
    label: "Nova categoria",
    description:
      "Substitui a seleção de categoria existente pelo ciclo de criação de uma nova categoria raiz.",
    icon: "FolderPlus",
  },
  summary: createCategorySummary,
} as const satisfies IntentDefinition<OperationIntentKey>

