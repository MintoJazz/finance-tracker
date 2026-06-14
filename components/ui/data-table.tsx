"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  Row,
} from "@tanstack/react-table"
import { ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal, SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// ─────────────────────────────────────────────
// Column Header Helper (sortable + hideable)
// ─────────────────────────────────────────────

interface DataTableColumnHeaderProps<TData, TValue> {
  column: import("@tanstack/react-table").Column<TData, TValue>
  title: string
  className?: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={className}>{title}</div>
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 data-[state=open]:bg-accent"
        >
          <span>{title}</span>
          {column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
          <ArrowUp className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          Asc
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
          <ArrowDown className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          Desc
        </DropdownMenuItem>
        {column.getCanHide() && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
              Hide
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─────────────────────────────────────────────
// Column Visibility Toggle
// ─────────────────────────────────────────────

interface DataTableViewOptionsProps<TData> {
  table: import("@tanstack/react-table").Table<TData>
}

export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon-sm" className="ml-auto h-8 lg:flex">
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-37.5">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== "undefined" && column.getCanHide()
          )
          .map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              className="capitalize"
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              {column.id}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─────────────────────────────────────────────
// Pagination Controls
// ─────────────────────────────────────────────

interface DataTablePaginationProps<TData> {
  table: import("@tanstack/react-table").Table<TData>
}

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex flex-col items-center justify-between gap-4 px-2 py-4 sm:flex-row">
      
      {/* Espaço reservado caso queira adicionar o contador de linhas selecionadas no futuro.
        Se não for usar, essa div vazia ajuda a empurrar os controles para a direita no desktop.
      */}
      <div className="hidden flex-1 text-sm text-muted-foreground sm:block">
        {/* Exemplo: {table.getFilteredSelectedRowModel().rows.length} de {table.getFilteredRowModel().rows.length} linha(s) selecionada(s) */}
      </div>

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8">
        
        {/* Linhas por página - Adicionado o 'flex' e ajustado o hidden para mobile conforme seu comentário original */}
        <div className="hidden sm:flex items-center space-x-2">
          <p className="text-sm font-medium">Linhas por página</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Controles de Navegação */}
        <div className="flex items-center gap-4">
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Pág. {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              // Removido o 'hidden lg:flex' para o botão aparecer sempre. 
              // Se quiser esconder em telas pequenas, use 'hidden sm:flex'
              className="flex h-8 w-8 p-0" 
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Ir para primeira página</span>
              {"«"}
            </Button>
            <Button
              variant="outline"
              className="flex h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Ir para página anterior</span>
              {"‹"}
            </Button>
            <Button
              variant="outline"
              className="flex h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Ir para próxima página</span>
              {"›"}
            </Button>
            <Button
              variant="outline"
              // Removido o 'hidden lg:flex'
              className="flex h-8 w-8 p-0" 
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Ir para última página</span>
              {"»"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
// ─────────────────────────────────────────────
// Row Actions Helper
// ─────────────────────────────────────────────

export interface RowAction<TData> {
  label: string
  onClick: (row: Row<TData>) => void
  separator?: boolean
}

// ─────────────────────────────────────────────
// Main DataTable Component
// ─────────────────────────────────────────────

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  showHeader?: boolean
  filterColumn?: string
  filterPlaceholder?: string
  enableRowSelection?: boolean
  rowActions?: RowAction<TData>[]
  pageSize?: number
  onRowSelectionChange?: (rows: Row<TData>[]) => void
  onRowClick?: (row: Row<TData>) => void
}

export function DataTable<TData, TValue>({
  columns: userColumns,
  data,
  showHeader = true,
  filterColumn,
  filterPlaceholder = "Filter...",
  enableRowSelection = false,
  rowActions,
  pageSize = 10,
  onRowSelectionChange,
  onRowClick
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  // ── Derive the filter column key ──────────────────────────────────────
  const activeFilterColumn = React.useMemo(() => {
    if (filterColumn) return filterColumn
    // fall back to the first column that has an accessorKey
    const first = userColumns.find(
      (col) => "accessorKey" in col && typeof col.accessorKey === "string"
    ) as { accessorKey: string } | undefined
    return first?.accessorKey ?? ""
  }, [filterColumn, userColumns])

  // ── Prepend selection column if requested ─────────────────────────────
  const selectionColumn: ColumnDef<TData, unknown> = React.useMemo(
    () => ({
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    }),
    []
  )

  // ── Append actions column if rowActions supplied ───────────────────────
  const actionsColumn: ColumnDef<TData, unknown> = React.useMemo(
    () => ({
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {rowActions!.map((action, i) => (
              <React.Fragment key={i}>
                {action.separator && <DropdownMenuSeparator />}
                <DropdownMenuItem onClick={() => action.onClick(row)}>
                  {action.label}
                </DropdownMenuItem>
              </React.Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      enableSorting: false,
      enableHiding: false,
    }),
    [rowActions]
  )

  const columns = React.useMemo<ColumnDef<TData, unknown>[]>(() => {
    const cols = [...(userColumns as ColumnDef<TData, unknown>[])]
    if (enableRowSelection) cols.unshift(selectionColumn)
    if (rowActions?.length) cols.push(actionsColumn)
    return cols
  }, [userColumns, enableRowSelection, selectionColumn, rowActions, actionsColumn])

  const table = useReactTable({
    data,
    columns,
    initialState: { pagination: { pageSize } },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (updaterOrValue) => {
      const next =
        typeof updaterOrValue === "function"
          ? updaterOrValue(rowSelection)
          : updaterOrValue
      setRowSelection(next)
    },
    enableRowSelection,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
  })

  // ── Propagate selection upward ─────────────────────────────────────────
  React.useEffect(() => {
    onRowSelectionChange?.(table.getFilteredSelectedRowModel().rows)
  }, [rowSelection]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="w-full space-y-2">
      {/* ── Toolbar ── */}
      {showHeader && (
        <div className="text-sm h-8 flex items-center gap-2 py-2">
          {activeFilterColumn && (
            <Input
              placeholder={filterPlaceholder}
              value={
                (table
                  .getColumn(activeFilterColumn)
                  ?.getFilterValue() as string) ?? ""
              }
              onChange={(e) =>
                table
                  .getColumn(activeFilterColumn)
                  ?.setFilterValue(e.target.value)
              }
              className="max-w-sm h-8"
            />
          )}
          <DataTableViewOptions table={table} />
        </div>
      )}

      {/* ── Table ── */}
      <div className="overflow-x-auto rounded-md border">
        <Table>
          {showHeader && (
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
          )}
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => onRowClick?.(row)}
                  className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={(cell.column.columnDef.meta as any)?.className}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination ── */}
      <DataTablePagination table={table} />
    </div>
  )
}