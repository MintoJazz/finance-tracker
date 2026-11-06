import { STEP_ORDER } from "../../steps/order"
import type { IntentSummary, SummaryCard, SummaryContext } from "../../summary/types"

export const createCategorySummary: IntentSummary = {
  order: STEP_ORDER.CREATE_CATEGORY_BASICS, // 4010
  build(ctx: SummaryContext): SummaryCard | null {
    const data = ctx.payload.CREATE_CATEGORY
    const name = data?.name?.trim() || "Nova Categoria"
    const color = data?.color || "#10B981"
    const icon = data?.icon || "Folder"

    return {
      id: "summary.intent.create_category",
      source: "CREATE_CATEGORY",
      order: STEP_ORDER.CREATE_CATEGORY_BASICS,
      title: "Criar Categoria",
      icon: "FolderPlus",
      badge: {
        label: "Nova",
        tone: "neutral",
      },
      visualItem: {
        title: name,
        subtitle: "Categoria raiz",
        icon,
        color,
        stepId: "intent.create_category.basics",
      },
    }
  },
  decorateBase(card: SummaryCard, ctx: SummaryContext): SummaryCard {
    const catName = ctx.payload.CREATE_CATEGORY?.name?.trim() || "Nova Categoria"
    const subName = ctx.payload.CREATE_SUBCATEGORY?.name?.trim() || "Nova Subcategoria"
    const categoryPath = `${catName} > ${subName}`

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
                stepId: "intent.create_category.basics",
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
            stepId: "intent.create_category.basics",
          },
        ]

    return {
      ...card,
      rows: updatedRows,
    }
  },
}
