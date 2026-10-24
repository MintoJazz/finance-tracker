import type { RowData } from "@tanstack/react-table"
import type { ActionCatalog, RowAction } from "@/types/actions.types"

export function actionsToCatalog<
  TData extends RowData = RowData,
  TContext = unknown,
>(actions: RowAction<TData, TContext>[]): ActionCatalog<TData, TContext> {
  return actions.reduce<ActionCatalog<TData, TContext>>((catalog, action, index) => {
    catalog[action.id ?? `action-${index}`] = action
    return catalog
  }, {})
}
