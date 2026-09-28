"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { getActionsColumn, getSelectionColumn } from "./columns"
import type { RowAction } from "./types"

interface UseDataTableColumnsOptions<TData, TValue, TContext> {
  columns: ColumnDef<TData, TValue>[]
  enableRowSelection: boolean
  rowActions?: RowAction<TData, TContext>[]
  actionContext?: TContext
}

/**
 * Monta a lista final de colunas:
 * [select?] + colunas do usuário + [actions?]
 */
export function useDataTableColumns<TData, TValue, TContext>({
  columns,
  enableRowSelection,
  rowActions,
  actionContext,
}: UseDataTableColumnsOptions<TData, TValue, TContext>) {
  return React.useMemo<ColumnDef<TData, unknown>[]>(() => {
    const cols = [...(columns as ColumnDef<TData, unknown>[])]

    if (enableRowSelection) {
      cols.unshift(getSelectionColumn<TData>())
    }

    if (rowActions?.length) {
      cols.push(getActionsColumn(rowActions, actionContext as TContext))
    }

    return cols
  }, [columns, enableRowSelection, rowActions, actionContext])
}