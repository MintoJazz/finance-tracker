/* eslint-disable @typescript-eslint/no-explicit-any */
import type React from "react"

export interface ActionRowObject<TData> {
  original: TData
}

export type RowActionHandler<TData, TContext = any> = (
  row: ActionRowObject<TData>,
  context?: TContext
) => void

export type RowActionPredicate<TData, TContext = any> = (
  row: ActionRowObject<TData>,
  context?: TContext
) => boolean

export interface RowAction<TData, TContext = any> {
  label: string | React.ReactNode
  onClick: RowActionHandler<TData, TContext>
  separator?: boolean
  hidden?: RowActionPredicate<TData, TContext>
  disabled?: boolean | RowActionPredicate<TData, TContext>
}

/**
 * Alias de RowAction para ergonomia e compatibilidade
 */
export type ActionRow<TData, TContext = any> = RowAction<TData, TContext>

export interface ActionsMenuProps<T, TContext = any> {
  actions?: RowAction<T, TContext>[]
  data: T
  context?: TContext
  actionContext?: TContext
  align?: "start" | "center" | "end"
  className?: string
}

export type RowActionsMenuProps<T, TContext = any> = ActionsMenuProps<T, TContext>
