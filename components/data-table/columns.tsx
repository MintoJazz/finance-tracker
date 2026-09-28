"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { DataTableRowActions } from "./row-actions"
import { SelectAllCheckbox, SelectRowCheckbox } from "./selection"
import type { RowAction } from "./types"

export function getSelectionColumn<TData>(): ColumnDef<TData, unknown> {
  return {
    id: "select",
    header: ({ table }) => <SelectAllCheckbox table={table} />,
    cell: ({ row }) => <SelectRowCheckbox row={row} />,
    enableSorting: false,
    enableHiding: false,
  }
}

export function getActionsColumn<TData, TContext>(
  rowActions: RowAction<TData, TContext>[],
  actionContext: TContext
): ColumnDef<TData, unknown> {
  return {
    id: "actions",
    header: () => <span className="sr-only">Ações</span>,
    cell: ({ row }) => (
      <DataTableRowActions
        row={row}
        actions={rowActions}
        context={actionContext}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  }
}