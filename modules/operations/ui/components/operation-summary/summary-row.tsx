"use client"

import * as React from "react"
import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { SummaryRow } from "@/modules/operations/application/summary/types"
import { SummaryValueView } from "./summary-value"

export interface SummaryRowProps {
  row: SummaryRow
  onEdit?: (stepId: string) => void
  className?: string
  isFooter?: boolean
}

export function SummaryRowView({
  row,
  onEdit,
  className,
  isFooter = false,
}: SummaryRowProps) {
  const handleEdit = () => {
    if (row.stepId && onEdit) {
      onEdit(row.stepId)
    }
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 px-3.5 py-2 min-w-0 text-xs transition-colors",
        isFooter ? "bg-muted/30 font-semibold" : "hover:bg-muted/20",
        className
      )}
    >
      <div className="flex flex-col min-w-0 flex-1 gap-0.5">
        <span className="text-[11px] font-medium text-muted-foreground truncate">
          {row.label}
        </span>
        <div className="flex items-center gap-1.5 min-w-0">
          <SummaryValueView value={row.value} />
        </div>
      </div>

      {row.stepId && onEdit && !isFooter && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={handleEdit}
          className="size-7 shrink-0 text-muted-foreground hover:text-foreground cursor-pointer"
          aria-label={`Editar ${row.label}`}
        >
          <Pencil className="size-3.5" />
        </Button>
      )}
    </div>
  )
}

