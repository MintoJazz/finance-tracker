import {
  buildInitialCategoryIntentSlice,
  CreateCategoryIntentSliceSchema,
} from "../../models/intents/create-category.schema"
import type { OperationIntentKey } from "../../models/operation-input.schema"
import { createSubcategoryIntentSteps } from "../steps/intents/create-category.steps"
import { STEP_ORDER } from "../steps/order"
import type { IntentDefinition } from "./types"

export const createSubcategoryIntent = {
  key: "CREATE_SUBCATEGORY",
  schema: CreateCategoryIntentSliceSchema,
  initialSlice: () => buildInitialCategoryIntentSlice(),
  addSteps: createSubcategoryIntentSteps,
  removeSteps: ["base.subcategory"],
  excludes: [],
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
    when: (_data, ctx) => Boolean(ctx.pointers.categoryRoot),
  },
  autoActivateWhen: (_data, ctx) => {
    const root = ctx.pointers.categoryRoot
    if (!root) return false
    // 1. Se a categoria raiz é um nó novo no DAG, ela tem 0 subcategorias existentes
    if (root.kind === "node") return true
    // 2. Se é uma categoria existente e temos os lookups, ativa quando tem 0 filhas
    if (!ctx.lookups) return false
    return !ctx.lookups.subcategories.some((sub) => sub.parentId === root.id)
  },
  plan(ctx) {
    const slice = ctx.payload.CREATE_SUBCATEGORY
    const ref = ctx.addNode({
      id: "intent.create_subcategory",
      source: "CREATE_SUBCATEGORY",
      order: STEP_ORDER.CREATE_SUBCATEGORY_BASICS,
      stepId: "intent.create_subcategory.basics",
      action: {
        type: "CREATE_CATEGORY_BALANCE",
        name: slice?.name?.trim() || "Nova Subcategoria",
        color: slice?.color ?? null,
        icon: slice?.icon ?? null,
        parent: ctx.pointers.categoryRoot,
      },
    })
    ctx.pointers.counterpart = ref
  },
} as const satisfies IntentDefinition<OperationIntentKey>
