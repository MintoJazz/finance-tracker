import type { ComponentType, ReactElement, ReactNode } from "react"
import type { Row, RowData } from "@tanstack/react-table"

export type RowLike<TData> = Row<TData> | { original: TData }

export type ActionIcon = ComponentType<{ className?: string }>

export type ActionColor =
  | "rose"
  | "emerald"
  | "blue"
  | "amber"
  | "indigo"
  | "purple"
  | "sky"
  | "neutral"

export interface RowAction<TData extends RowData = any, TContext = any> {
  id?: string
  label: string | ReactNode
  icon?: ActionIcon | ReactNode
  href?: string
  shortcut?: string
  color?: ActionColor
  colorClassName?: string
  hidden?: (row: RowLike<TData>, context?: TContext) => boolean
  disabled?: boolean | ((row: RowLike<TData>, context?: TContext) => boolean)
  onClick?: (row: RowLike<TData>, context: TContext) => void | Promise<void>
  variant?: "default" | "destructive"
  separator?: boolean
  separatorBefore?: boolean
  confirmTitle?: string
  confirmDescription?: string
}

export type ActionRow<TData extends RowData = any, TContext = any> = RowAction<
  TData,
  TContext
>

export type ActionCatalog<
  TData extends RowData = RowData,
  TContext = unknown,
> = Record<string, RowAction<TData, TContext>>

export interface DataTableRowActionsProps<
  TData extends RowData = any,
  TContext = any,
> {
  row?: RowLike<TData> | TData
  actions?: RowAction<TData, TContext>[]
  actionGroups?: RowAction<TData, TContext>[][]
  context?: TContext
  onAction?: (
    action: RowAction<TData, TContext>,
    row: RowLike<TData>,
    context?: TContext
  ) => void
  trigger?: ReactElement
  children?: ReactNode
  label?: string | ReactNode
  header?: ReactNode
  footer?: ReactNode
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  sideOffset?: number
  contentClassName?: string
}

export type ActionsMenuProps<
  TData extends RowData = any,
  TContext = any,
> = DataTableRowActionsProps<TData, TContext>