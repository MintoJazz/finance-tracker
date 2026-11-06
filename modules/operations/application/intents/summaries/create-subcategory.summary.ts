import { STEP_ORDER } from "../../steps/order"
import type { IntentSummary, SummaryCard, SummaryContext } from "../../summary/types"

export const createSubcategorySummary: IntentSummary = {
  order: STEP_ORDER.CREATE_SUBCATEGORY_BASICS, // 4110
  build(ctx: SummaryContext): SummaryCard | null {
    const data = ctx.payload.CREATE_SUBCATEGORY
    const name = data?.name?.trim() || "Nova Subcategoria"
    const color =
      data?.color ||
      ctx.payload.CREATE_CATEGORY?.color ||
      "#10B981"
    const icon = data?.icon || "Folder"

    const parentCategory = ctx.lookups.categories.find(
      (c) => c.id === ctx.payload.base?.categoryId
    )
    const parentName =
      ctx.payload.CREATE_CATEGORY?.name?.trim() ||
      parentCategory?.name ||
      "Categoria Base"

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
        title: name,
        subtitle: `Subcategoria • ${parentName}`,
        icon,
        color,
        stepId: "intent.create_subcategory.basics",
      },
    }
  },
  decorateBase(card: SummaryCard, ctx: SummaryContext): SummaryCard {
    // Se CREATE_CATEGORY também está ativa, ela já compôs a linha "Categoria > Subcategoria"
    if (ctx.activeIntents.includes("CREATE_CATEGORY")) {
      return card
    }

    const parentCategory = ctx.lookups.categories.find(
      (c) => c.id === ctx.payload.base?.categoryId
    )
    const parentName = parentCategory?.name || "Categoria"
    const subName =
      ctx.payload.CREATE_SUBCATEGORY?.name?.trim() || "Nova Subcategoria"
    const categoryPath = `${parentName} > ${subName}`

    const existingRows = card.rows ?? []
    const hasCat = existingRows.some((r) => r.id === "base_category")

    const updatedRows = hasCat
      ? existingRows.map((row) =>
          row.id === "base_category"
            ? {
                ...row,
                label: "Categoria",
                value: {
                  kind: "text" as const,
                  text: categoryPath,
                },
                stepId: "intent.create_subcategory.basics",
              }
            : row
        )
      : [
          ...existingRows,
          {
            id: "base_category",
            label: "Categoria",
            value: {
              kind: "text" as const,
              text: categoryPath,
            },
            stepId: "intent.create_subcategory.basics",
          },
        ]

    return {
      ...card,
      rows: updatedRows,
    }
  },
}
