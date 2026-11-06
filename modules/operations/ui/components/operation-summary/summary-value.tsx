"use client"

import * as React from "react"
import { formatDate, formatMoney } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import type { SummaryValue } from "@/modules/operations/application/summary/types"

export interface SummaryValueProps {
  value: SummaryValue | null | undefined
  className?: string
}

export function SummaryValueView({ value, className }: SummaryValueProps) {
  if (!value) {
    return <span className={cn("text-muted-foreground font-normal text-xs", className)}>—</span>
  }

  switch (value.kind) {
    case "money":
      return (
        <span
          className={cn(
            "font-mono font-bold tabular-nums text-foreground text-sm",
            className
          )}
        >
          {formatMoney(value.cents)}
        </span>
      )

    case "date":
      return (
        <span className={cn("font-medium text-foreground text-xs", className)}>
          {formatDate(value.iso)}
        </span>
      )

    case "text":
    default:
      return (
        <span
          className={cn(
            "font-semibold text-foreground text-xs truncate block",
            className
          )}
        >
          {value.text}
        </span>
      )
  }
}

