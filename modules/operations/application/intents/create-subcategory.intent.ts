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
  summaryCard(ctx) {
    const slice = ctx.payload.CREATE_SUBCATEGORY
    const isCreateCategoryActive = ctx.activeIntents.includes("CREATE_CATEGORY")

    let parentName = "Categoria Base"
    let parentColor: string | null = null

    if (isCreateCategoryActive && ctx.payload.CREATE_CATEGORY?.name) {
      parentName = ctx.payload.CREATE_CATEGORY.name.trim() || "Nova Categoria"
      parentColor = ctx.payload.CREATE_CATEGORY.color ?? null
    } else if (ctx.payload.base?.categoryId) {
      const parentCat = ctx.lookups.categories.find(
        (c) => c.id === ctx.payload.base?.categoryId
      )
      if (parentCat) {
        parentName = parentCat.name
        parentColor = parentCat.color ?? null
      }
    }

    const inheritedColor = slice?.color || parentColor || "#10B981"

    return {
      id: "summary.intent.create_subcategory",
      source: "CREATE_SUBCATEGORY",
      order: STEP_ORDER.CREATE_SUBCATEGORY_BASICS,
      title: "Criar Subcategoria",
      icon: "FolderPlus",
      badge: {
        label: "Nova",
        tone: "neutral",
      },
      visualItem: {
        title: slice?.name?.trim() || "Nova Subcategoria",
        subtitle: `Subcategoria • ${parentName}`,
        icon: slice?.icon || "Folder",
        color: inheritedColor,
        stepId: "intent.create_subcategory.basics",
      },
    }
  },
} as const satisfies IntentDefinition<OperationIntentKey>
