"use client"

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type Updater,
  type VisibilityState,
} from "@tanstack/react-table"

import { cn } from "cn"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { DataTablePagination } from "./pagination"
import { DataTableViewOptions } from "./view-options"
import type { DataTableProps } from "./types"
import { useDataTableColumns } from "./hook"

export function DataTable<TData, TValue, TContext = any>({
  columns: userColumns,
  data,
  showHeader = true,
  filterColumn,
  filterPlaceholder = "Filtrar...",
  enableRowSelection = false,
  rowActions,
  actionContext,
  pageSize = 10,
  enablePagination = true,
  manualPagination = false,
  pageCount,
  pageIndex,
  onPageChange,
  onPageSizeChange,
  onRowSelectionChange,
  onRowClick,
}: DataTableProps<TData, TValue, TContext>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [localPagination, setLocalPagination] = React.useState<PaginationState>({
    pageIndex: pageIndex ?? 0,
    pageSize,
  })

  const paginationState: PaginationState =
    manualPagination && pageIndex !== undefined
      ? { pageIndex, pageSize }
      : localPagination

  const handlePaginationChange = (updater: Updater<PaginationState>) => {
    const next = typeof updater === "function" ? updater(paginationState) : updater

    if (manualPagination) {
      if (next.pageIndex !== pageIndex) onPageChange?.(next.pageIndex)
      if (next.pageSize !== pageSize) onPageSizeChange?.(next.pageSize)
    } else {
      setLocalPagination(next)
    }
  }

  // Coluna usada no filtro: a informada ou a primeira com accessorKey
  const activeFilterColumn = React.useMemo(() => {
    if (filterColumn) return filterColumn
    const first = userColumns.find(
      (col) => "accessorKey" in col && typeof col.accessorKey === "string"
    ) as { accessorKey: string } | undefined
    return first?.accessorKey ?? ""
  }, [filterColumn, userColumns])

  const columns = useDataTableColumns<TData, TValue, TContext>({
    columns: userColumns,
    enableRowSelection,
    rowActions,
    actionContext,
  })

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel:
      enablePagination && !manualPagination ? getPaginationRowModel() : undefined,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: handlePaginationChange,
    enableRowSelection,
    manualPagination,
    pageCount: manualPagination ? pageCount : undefined,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: paginationState,
    },
  })

  // Propaga a seleção para o componente pai
  React.useEffect(() => {
    onRowSelectionChange?.(table.getFilteredSelectedRowModel().rows)
  }, [rowSelection]) // eslint-disable-line react-hooks/exhaustive-deps

  const filterCol = activeFilterColumn ? table.getColumn(activeFilterColumn) : undefined

  return (
    <div className="w-full space-y-2">
      {showHeader && (
        <div className="flex h-8 items-center gap-2 py-2 text-sm">
          {filterCol && (
            <Input
              placeholder={filterPlaceholder}
              value={(filterCol.getFilterValue() as string) ?? ""}
              onChange={(e) => filterCol.setFilterValue(e.target.value)}
              className="h-8 max-w-sm"
            />
          )}
          <DataTableViewOptions table={table} />
        </div>
      )}

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta
                  const size = meta?.width ?? header.column.columnDef.size
                  const minSize = header.column.columnDef.minSize
                  const maxSize = header.column.columnDef.maxSize

                  return (
                    <TableHead
                      key={header.id}
                      className={cn(meta?.className, meta?.headerClassName)}
                      style={{
                        width: size !== undefined ? (typeof size === "number" ? `${size}px` : size) : undefined,
                        minWidth: minSize !== undefined ? (typeof minSize === "number" ? `${minSize}px` : minSize) : undefined,
                        maxWidth: maxSize !== undefined ? (typeof maxSize === "number" ? `${maxSize}px` : maxSize) : undefined,
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={(e) => {
                    if (!e.currentTarget.contains(e.target as Node)) return
                    onRowClick?.(row)
                  }}
                  className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                >
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta
                    const size = meta?.width ?? cell.column.columnDef.size
                    const minSize = cell.column.columnDef.minSize
                    const maxSize = cell.column.columnDef.maxSize

                    return (
                      <TableCell
                        key={cell.id}
                        className={cn(meta?.className, meta?.cellClassName)}
                        style={{
                          width: size !== undefined ? (typeof size === "number" ? `${size}px` : size) : undefined,
                          minWidth: minSize !== undefined ? (typeof minSize === "number" ? `${minSize}px` : minSize) : undefined,
                          maxWidth: maxSize !== undefined ? (typeof maxSize === "number" ? `${maxSize}px` : maxSize) : undefined,
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Nenhum resultado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {enablePagination && <DataTablePagination table={table} />}
    </div>
  )
}