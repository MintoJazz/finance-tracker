// components/data-table/columns.tsx
"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { DataTableRowActions } from "./row-actions"
import { SelectAllCheckbox, SelectRowCheckbox } from "./selection"
import type { RowAction } from "./types"

export function getSelectionColumn<TData>(): ColumnDef<TData, unknown> {
  return {
    id: "select",
    size: 40,
    meta: {
      className: "w-10 px-2",
    },
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
    size: 50,
    meta: {
      className: "w-12 text-right",
    },
    header: () => <span className="sr-only">Ações</span>,
    cell: ({ row }) => (
      <div
        role="presentation"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <DataTableRowActions
          row={row}
          actions={rowActions}
          context={actionContext}
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  }
}