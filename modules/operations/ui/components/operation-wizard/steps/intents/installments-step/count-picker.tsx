"use client"

import * as React from "react"
import { Layers } from "lucide-react"
import { cn } from "@/lib/utils"
import { useOperationWizard } from "@/modules/operations/ui/components/operation-wizard/context"

const INSTALLMENT_COUNTS = [2, 3, 4, 6, 10, 12, 18, 24] as const

export interface InstallmentsCountPickerProps {
  value?: number
  onChange: (count: number) => void
  showIntentPills?: boolean
}

export function InstallmentsCountPicker({
  value = 2,
  onChange,
  showIntentPills = false,
}: InstallmentsCountPickerProps) {
  const { updateDraft } = useOperationWizard()

  const handleSelect = (n: number) => {
    onChange(n)
    updateDraft({
      DEMO_INSTALLMENTS: {
        count: n,
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
        {INSTALLMENT_COUNTS.map((n) => {
          const isSelected = value === n
          return (
            <button
              key={n}
              type="button"
              data-vaul-no-drag=""
              data-swipe-ignore=""
              data-base-ui-swipe-ignore=""
              onClick={() => handleSelect(n)}
              aria-pressed={isSelected}
              className={cn(
                "flex items-center justify-center gap-1.5 h-10 px-3.5 rounded-xl border text-xs font-semibold shrink-0 transition-all cursor-pointer",
                isSelected
                  ? "border-primary bg-primary/12 text-primary ring-1 ring-primary/20"
                  : "border-border/70 bg-card/50 text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Layers className="size-3.5" />
              <span>{n}x</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
