import {
  buildInitialCategoryIntentSlice,
  CreateCategoryIntentSliceSchema,
} from "../../models/intents/create-category.schema"
import type { OperationIntentKey } from "../../models/operation-input.schema"
import { createCategoryIntentSteps } from "../steps/intents/create-category.steps"
import { STEP_ORDER } from "../steps/order"
import type { IntentDefinition } from "./types"

export const createCategoryIntent = {
  key: "CREATE_CATEGORY",
  schema: CreateCategoryIntentSliceSchema,
  initialSlice: () => buildInitialCategoryIntentSlice(),
  addSteps: createCategoryIntentSteps,
  removeSteps: ["base.category"],
  excludes: [],
  requires: [],
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
  plan(ctx) {
    const slice = ctx.payload.CREATE_CATEGORY
    const ref = ctx.addNode({
      id: "intent.create_category",
      source: "CREATE_CATEGORY",
      order: STEP_ORDER.CREATE_CATEGORY_BASICS,
      stepId: "intent.create_category.basics",
      action: {
        type: "CREATE_CATEGORY_BALANCE",
        name: slice?.name?.trim() || "Nova Categoria",
        color: slice?.color ?? null,
        icon: slice?.icon ?? null,
        parent: null,
      },
    })
    ctx.pointers.categoryRoot = ref
    ctx.pointers.counterpart = ref
  },
} as const satisfies IntentDefinition<OperationIntentKey>

