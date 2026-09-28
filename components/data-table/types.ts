import type { ColumnDef, Row } from "@tanstack/react-table"

export interface RowAction<TData, TContext = any> {
  label: string
  onClick: (row: Row<TData>, context: TContext) => void
  separator?: boolean
  hidden?: (row: Row<TData>, context: TContext) => boolean
}

export interface DataTableProps<TData, TValue, TContext = any> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  showHeader?: boolean
  filterColumn?: string
  filterPlaceholder?: string
  enableRowSelection?: boolean
  rowActions?: RowAction<TData, TContext>[]
  actionContext?: TContext
  pageSize?: number
  enablePagination?: boolean
  manualPagination?: boolean
  pageCount?: number
  pageIndex?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  onRowSelectionChange?: (rows: Row<TData>[]) => void
  onRowClick?: (row: Row<TData>) => void
}