import type { ColumnDef, Row, RowData } from "@tanstack/react-table"
import type { RowAction } from "@/types/actions.types"

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    className?: string
    headerClassName?: string
    cellClassName?: string
    width?: string | number
  }
}

export type { RowAction } from "@/types/actions.types"

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