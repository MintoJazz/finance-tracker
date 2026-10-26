"use client"

import * as React from "react"
import Link from "next/link"
import type { RowData } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { ActionsDrawer } from "@/components/actions/drawer"
import { DataTableRowActions, renderActionIcon } from "@/components/actions/menu"
import { useIsDesktop } from "@/hooks/use-breakpoint"
import { cn } from "@/lib/utils"
import type {
  ActionCatalog,
  RowAction,
  RowLike,
} from "@/types/actions.types"
import { getQuickActionTheme } from "./themes"

export interface QuickActionsProps<
  TData extends RowData = RowData,
  TContext = unknown,
> {
  row: TData | RowLike<TData>
  actions: ActionCatalog<TData, TContext> | RowAction<TData, TContext>[]
  context?: TContext
  optionsHeader?: React.ReactNode
  optionsLabel?: React.ReactNode
  optionsContentClassName?: string
  optionsTriggerLabel?: string
  maxVisibleActions?: number
  className?: string
}

const GRID_COLUMNS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
}

export function QuickActions<
  TData extends RowData = RowData,
  TContext = unknown,
>({
  row,
  actions,
  context,
  optionsHeader,
  optionsLabel,
  optionsContentClassName,
  optionsTriggerLabel = "Opções",
  maxVisibleActions = 3,
  className,
}: QuickActionsProps<TData, TContext>) {
  const isDesktop = useIsDesktop()

  const normalizedRow = React.useMemo(() => {
    if (!row) return undefined
    return typeof row === "object" && "original" in row
      ? (row as RowLike<TData>)
      : ({ original: row as TData } as RowLike<TData>)
  }, [row])

  const actionList = React.useMemo<RowAction<TData, TContext>[]>(() => {
    if (Array.isArray(actions)) return actions
    return Object.values(actions) as RowAction<TData, TContext>[]
  }, [actions])

  const visibleActions = React.useMemo(() => {
    if (!normalizedRow) return []
    return actionList.filter(
      (action) => !action.hidden?.(normalizedRow, context)
    )
  }, [actionList, normalizedRow, context])

  if (!normalizedRow) return null

  if (visibleActions.length === 0) return null

  const primaryActions = visibleActions.slice(0, maxVisibleActions)
  const overflowActions = visibleActions.slice(maxVisibleActions)
  const optionsActions = isDesktop ? overflowActions : visibleActions
  const showOptions = optionsActions.length > 0

  const columns = Math.min(
    5,
    primaryActions.length + (showOptions ? 1 : 0)
  )

  const optionsTrigger = (
    <button
      type="button"
      className="group flex flex-col items-center gap-1 cursor-pointer min-w-0"
    >
      <div className="w-full max-w-12 sm:max-w-13 h-9 sm:h-9.5 rounded-xl border border-border/70 bg-muted/60 dark:bg-muted/40 flex items-center justify-center transition-all group-hover:scale-105 active:scale-95 group-hover:bg-muted group-hover:shadow-xs">
        <MoreHorizontal className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
      <span className="text-[11px] font-medium text-foreground text-center truncate w-full">
        {optionsTriggerLabel}
      </span>
    </button>
  )

  return (
    <div
      className={cn(
        "grid gap-2 w-full",
        GRID_COLUMNS[columns] ?? "grid-cols-4",
        className
      )}
    >
      {primaryActions.map((action, index) => {
        const key = action.id ?? index
        const isDisabled =
          typeof action.disabled === "function"
            ? action.disabled(normalizedRow, context)
            : action.disabled
        const theme = getQuickActionTheme(action.color)

        const content = (
          <>
            <div
              className={cn(
                "w-full max-w-12 sm:max-w-13 h-9 sm:h-9.5 rounded-xl border flex items-center justify-center transition-all group-hover:scale-105 active:scale-95 group-hover:shadow-xs",
                theme.containerClassName,
                action.colorClassName
              )}
            >
              {renderActionIcon(
                action.icon,
                cn(
                  "size-4 transition-transform group-hover:-translate-y-0.5",
                  theme.iconClassName
                )
              )}
            </div>
            <span className="text-[11px] font-medium text-foreground text-center truncate w-full">
              {action.label}
            </span>
          </>
        )

        const tileClassName =
          "group flex flex-col items-center gap-1 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 min-w-0"

        if (action.href && !isDisabled) {
          return (
            <Link
              key={key}
              href={action.href}
              className={tileClassName}
              onClick={() => {
                void action.onClick?.(normalizedRow, context as TContext)
              }}
            >
              {content}
            </Link>
          )
        }

        return (
          <button
            key={key}
            type="button"
            disabled={isDisabled}
            onClick={() => {
              void action.onClick?.(normalizedRow, context as TContext)
            }}
            className={tileClassName}
          >
            {content}
          </button>
        )
      })}

      {showOptions &&
        (isDesktop ? (
          <DataTableRowActions
            row={normalizedRow}
            actions={optionsActions}
            context={context}
            trigger={optionsTrigger}
          />
        ) : (
          <ActionsDrawer
            row={normalizedRow}
            actions={optionsActions}
            context={context}
            trigger={optionsTrigger}
            header={optionsHeader}
            label={optionsLabel}
            contentClassName={optionsContentClassName}
          />
        ))}
    </div>
  )
}

export default QuickActions
