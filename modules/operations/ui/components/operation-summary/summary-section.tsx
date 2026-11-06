"use client"

import * as React from "react"
import { Users } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SummarySection } from "@/modules/operations/application/summary/types"
import { SummaryRowView } from "./summary-row"

export interface SummarySectionProps {
  section: SummarySection
  onEdit?: (stepId: string) => void
  className?: string
}

export function SummarySectionView({
  section,
  onEdit,
  className,
}: SummarySectionProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border/60 bg-muted/15 overflow-hidden m-2 space-y-0 divide-y divide-border/40",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-muted/30">
        <div className="flex items-center gap-1.5 min-w-0">
          <Users className="size-3.5 text-primary shrink-0" />
          <span className="text-xs font-semibold text-foreground truncate">
            {section.title}
          </span>
        </div>
        {section.subtitle && (
          <span className="text-[10px] text-muted-foreground shrink-0 font-medium">
            {section.subtitle}
          </span>
        )}
      </div>

      <div className="divide-y divide-border/30">
        {section.rows.map((row) => (
          <SummaryRowView key={row.id} row={row} onEdit={onEdit} className="py-1.5 px-3" />
        ))}
      </div>

      {section.footer && section.footer.length > 0 && (
        <div className="divide-y divide-border/30">
          {section.footer.map((row) => (
            <SummaryRowView
              key={row.id}
              row={row}
              onEdit={onEdit}
              isFooter
              className="py-1.5 px-3"
            />
          ))}
        </div>
      )}
    </div>
  )
}

