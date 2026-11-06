import { CreateCategoryIntentSliceSchema } from "../../models/intents/create-category.schema"
import type { OperationIntentKey } from "../../models/operation-input.schema"
import { createSubcategoryIntentSteps } from "../steps/intents/create-category.steps"
import { createSubcategorySummary } from "./summaries/create-subcategory.summary"
import type { IntentDefinition } from "./types"

export const createSubcategoryIntent = {
  key: "CREATE_SUBCATEGORY",
  schema: CreateCategoryIntentSliceSchema,
  addSteps: createSubcategoryIntentSteps,
  removeSteps: ["base.subcategory"],
  excludes: ["DEMO_SETTLE"],
  requires: [],
  offer: {
    at: [
      "base.subcategory",
      "intent.create_subcategory.basics",
      "intent.create_subcategory.color",
      "intent.create_subcategory.icon",
    ],
    label: "Nova subcategoria",
    description:
      "Injeta um ciclo de criação para cadastrar uma nova subcategoria vinculada à categoria selecionada.",
    icon: "PlusCircle",
    when: (data) =>
      Boolean(data?.base?.categoryId) ||
      Boolean(data?.intents?.includes("CREATE_CATEGORY")),
  },
  summary: createSubcategorySummary,
} as const satisfies IntentDefinition<OperationIntentKey>
