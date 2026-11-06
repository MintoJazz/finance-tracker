"use client"

import * as React from "react"
import { CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"
import { useOperationWizard } from "@/modules/operations/ui/components/operation-wizard/context"

const INTERVAL_OPTIONS = [
  { days: 7, label: "Semanal (7d)" },
  { days: 15, label: "Quinzenal (15d)" },
  { days: 30, label: "Mensal (30d)" },
  { days: 60, label: "Bimestral (60d)" },
] as const

export interface InstallmentsIntervalPickerProps {
  value?: number
  onChange: (days: number) => void
  showIntentPills?: boolean
}

export function InstallmentsIntervalPicker({
  value = 30,
  onChange,
  showIntentPills = true,
}: InstallmentsIntervalPickerProps) {
  const { updateDraft } = useOperationWizard()

  const handleSelect = (days: number) => {
    onChange(days)
    updateDraft({
      DEMO_INSTALLMENTS: {
        intervalDays: days,
      },
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        data-vaul-no-drag=""
        data-swipe-ignore=""
        data-base-ui-swipe-ignore=""
        style={{ touchAction: "pan-x" }}
        className="flex items-center gap-2 overflow-x-auto py-1 px-0.5 no-scrollbar select-none"
      >
        {INTERVAL_OPTIONS.map((opt) => {
          const isSelected = value === opt.days
          return (
            <button
              key={opt.days}
              type="button"
              data-vaul-no-drag=""
              data-swipe-ignore=""
              data-base-ui-swipe-ignore=""
              onClick={() => handleSelect(opt.days)}
              aria-pressed={isSelected}
              className={cn(
                "flex items-center justify-center gap-1.5 h-10 px-3.5 rounded-xl border text-xs font-semibold shrink-0 transition-all cursor-pointer",
                isSelected
                  ? "border-primary bg-primary/12 text-primary ring-1 ring-primary/20"
                  : "border-border/70 bg-card/50 text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <CalendarDays className="size-3.5" />
              <span>{opt.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
