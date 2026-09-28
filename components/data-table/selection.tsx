"use client"

import type { Row, Table } from "@tanstack/react-table"

import { Checkbox } from "@/components/ui/checkbox"

export function SelectAllCheckbox<TData>({ table }: { table: Table<TData> }) {
  const allSelected = table.getIsAllPageRowsSelected()
  const someSelected = table.getIsSomePageRowsSelected()

  return (
    <Checkbox
      checked={allSelected}
      indeterminate={!allSelected && someSelected}
      onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      aria-label="Selecionar todas"
    />
  )
}

export function SelectRowCheckbox<TData>({ row }: { row: Row<TData> }) {
  return (
    <span role="presentation" onClick={(e) => e.stopPropagation()}>
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Selecionar linha"
      />
    </span>
  )
}