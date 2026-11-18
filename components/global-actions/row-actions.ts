"use client"

import * as React from "react"
import type { RowData } from "@tanstack/react-table"
import type { ActionCatalog, RowAction } from "@/types/actions.types"
import { useGlobalActions } from "./context"
import type { GlobalAction } from "./types"

export interface RowActionsToGlobalOptions<TData extends RowData, TContext> {
  actions: RowAction<TData, TContext>[] | ActionCatalog<TData, TContext>
  /** Linha analisada (ex.: o perfil da página). Sem linha, nenhuma ação é registrada. */
  row: TData | null | undefined
  context?: TContext
  /** Troca o id de ações do catálogo (id de origem -> id global), p.ex. `{ income: { id: "receive" } }`. */
  overrides?: Record<string, Partial<Pick<GlobalAction, "id">>>
}

/** Converte um catálogo de row actions em ações globais, resolvendo hidden/disabled com a linha. */
export function rowActionsToGlobalActions<TData extends RowData, TContext>({
  actions,
  row,
  context,
  overrides,
}: RowActionsToGlobalOptions<TData, TContext>): GlobalAction[] {
  if (row == null) return []
  const rowLike = { original: row }
  const list = Array.isArray(actions) ? actions : Object.values(actions)

  return list.flatMap((action, index) => {
    if (action.hidden?.(rowLike, context)) return []
    const sourceId = action.id ?? `action-${index}`
    const disabled =
      typeof action.disabled === "function"
        ? action.disabled(rowLike, context)
        : action.disabled

    return [
      {
        id: overrides?.[sourceId]?.id ?? sourceId,
        label: action.label,
        icon: action.icon,
        href: action.href,
        variant: action.variant,
        disabled,
        confirmTitle: action.confirmTitle,
        confirmDescription: action.confirmDescription,
        onClick: action.onClick
          ? () => action.onClick?.(rowLike, context as TContext)
          : undefined,
      } satisfies GlobalAction,
    ]
  })
}

/** Registra as row actions de uma linha (perfil) como ações globais da página. */
export function useRowGlobalActions<TData extends RowData, TContext>(
  options: RowActionsToGlobalOptions<TData, TContext>
) {
  const { actions, row, context, overrides } = options
  const globalActions = React.useMemo(
    () => rowActionsToGlobalActions({ actions, row, context, overrides }),
    [actions, row, context, overrides]
  )
  useGlobalActions(globalActions)
}
