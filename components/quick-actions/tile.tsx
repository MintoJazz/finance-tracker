"use client"

import * as React from "react"
import Link from "next/link"
import type { RowData } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { renderActionIcon } from "@/components/actions/menu"
import { cn } from "@/lib/utils"
import type { ActionColor, RowAction, RowLike } from "@/types/actions.types"
import { getQuickActionTheme } from "./themes"

export interface QuickActionTileProps<
  TData extends RowData = RowData,
  TContext = unknown,
> {
  action: RowAction<TData, TContext>
  row: RowLike<TData>
  context?: TContext
  color?: ActionColor
  className?: string
  innerClassName?: string
}

export function QuickActionTile<
  TData extends RowData = RowData,
  TContext = unknown,
>({
  action,
  row,
  context,
  color,
  className,
  innerClassName,
}: QuickActionTileProps<TData, TContext>) {
  const isDisabled =
    typeof action.disabled === "function"
      ? action.disabled(row, context)
      : action.disabled
  const theme = getQuickActionTheme(color ?? action.color)

  const content = (
    <>
      <div
        className={cn(
          "w-full max-w-12 sm:max-w-13 h-9 sm:h-9.5 rounded-xl border flex items-center justify-center transition-all group-hover:scale-105 active:scale-95 group-hover:shadow-xs",
          theme.containerClassName,
          action.colorClassName,
          innerClassName
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

  const tileClassName = cn(
    "group flex flex-col items-center gap-1 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 min-w-0",
    className
  )

  if (action.href && !isDisabled) {
    return (
      <Link
        href={action.href}
        className={tileClassName}
        onClick={() => {
          void action.onClick?.(row, context as TContext)
        }}
      >
        {content}
      </Link>
    )
  }

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={() => {
        void action.onClick?.(row, context as TContext)
      }}
      className={tileClassName}
    >
      {content}
    </button>
  )
}

export interface QuickActionOptionsTriggerProps {
  label?: React.ReactNode
  className?: string
}

export function QuickActionOptionsTrigger({
  label = "Opções",
  className,
}: QuickActionOptionsTriggerProps) {
  return (
    <button
      type="button"
      className={cn(
        "group flex flex-col items-center gap-1 cursor-pointer min-w-0",
        className
      )}
    >
      <div className="w-full max-w-12 sm:max-w-13 h-9 sm:h-9.5 rounded-xl border border-border/70 bg-muted/60 dark:bg-muted/40 flex items-center justify-center transition-all group-hover:scale-105 active:scale-95 group-hover:bg-muted group-hover:shadow-xs">
        <MoreHorizontal className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
      <span className="text-[11px] font-medium text-foreground text-center truncate w-full">
        {label}
      </span>
    </button>
  )
}
