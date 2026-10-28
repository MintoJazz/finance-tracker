"use client"

import * as React from "react"
import type { RowData } from "@tanstack/react-table"
import { ActionsDrawer } from "@/components/actions/drawer"
import { DataTableRowActions } from "@/components/actions/menu"
import { useIsDesktop } from "@/hooks/use-breakpoint"
import { cn } from "@/lib/utils"
import type {
  ActionCatalog,
  ActionColor,
  RowAction,
  RowLike,
} from "@/types/actions.types"
import { QuickActionOptionsTrigger, QuickActionTile } from "./tile"

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
  variant?: "default" | "inline"
  colorMap?: Record<string, ActionColor>
}

const GRID_COLUMNS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
}

const DEFAULT_ACTION_COLOR_MAP: Record<string, ActionColor> = {
  settle: "emerald",
  consolidate: "emerald",
  "adjust-value": "amber",
  discard: "rose",
  expense: "rose",
  "pay-invoice": "emerald",
  "adjust-limit": "blue",
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
  maxVisibleActions,
  className,
  variant = "default",
  colorMap,
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

  if (!normalizedRow || visibleActions.length === 0) return null

  const isInline = variant === "inline"

  // Regra de quantidade de tiles:
  // Máximo de 4 tiles no total.
  // Se variant === "inline":
  //   Se visibleActions > 4: 3 primárias + 1 "Opções" com as excedentes.
  //   Se visibleActions <= 4: todas primárias. "Opções" aparece apenas se houver excedente no menu.
  // Se variant === "default":
  //   Mantém o padrão clássico do projeto (3 primárias + Opções para o restante).
  const defaultMax = isInline
    ? (visibleActions.length > 4 ? 3 : 4)
    : 3

  const effectiveMaxVisible = maxVisibleActions ?? defaultMax

  const primaryActions = visibleActions.slice(0, effectiveMaxVisible)
  const overflowActions = visibleActions.slice(effectiveMaxVisible)
  const optionsActions = isDesktop ? overflowActions : visibleActions
  const showOptions = overflowActions.length > 0

  const tileClassName = isInline
    ? "w-full sm:w-14 sm:min-w-[56px] shrink-0"
    : undefined

  const optionsTrigger = (
    <QuickActionOptionsTrigger
      label={optionsTriggerLabel}
      className={tileClassName}
    />
  )

  const resolveColor = (action: RowAction<TData, TContext>): ActionColor | undefined => {
    if (action.color) return action.color
    const id = action.id ?? ""
    if (colorMap && id in colorMap) return colorMap[id]
    if (id in DEFAULT_ACTION_COLOR_MAP) return DEFAULT_ACTION_COLOR_MAP[id]
    return undefined
  }

  if (isInline) {
    return (
      <div
        className={cn(
          "grid grid-cols-4 gap-2 w-full sm:flex sm:items-center sm:justify-end sm:gap-2 sm:w-auto",
          className
        )}
      >
        {primaryActions.map((action, index) => (
          <QuickActionTile
            key={action.id ?? index}
            action={action}
            row={normalizedRow}
            context={context}
            color={resolveColor(action)}
            className={tileClassName}
          />
        ))}

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

  const columns = Math.min(
    5,
    primaryActions.length + (showOptions ? 1 : 0)
  )

  return (
    <div
      className={cn(
        "grid gap-2 w-full",
        GRID_COLUMNS[columns] ?? "grid-cols-4",
        className
      )}
    >
      {primaryActions.map((action, index) => (
        <QuickActionTile
          key={action.id ?? index}
          action={action}
          row={normalizedRow}
          context={context}
          color={resolveColor(action)}
        />
      ))}

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
export * from "./tile"
export * from "./themes"

