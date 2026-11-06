"use client"

import * as React from "react"
import { MoneyInput } from "@/components/form"
import { useOperationWizard } from "@/modules/operations/ui/components/operation-wizard/context"

export interface ReimbursementAmountFieldProps {
  value?: number
  onChange: (val: number | undefined) => void
  showIntentPills?: boolean
}

export function ReimbursementAmountField({
  value,
  onChange,
}: ReimbursementAmountFieldProps) {
  const { updateDraft } = useOperationWizard()

  const handleChange = (val: number | undefined) => {
    onChange(val)
    updateDraft({
      DEMO_REIMBURSEMENT: {
        reimbursedAmount: val,
      },
    })
  }

  return (
    <MoneyInput
      value={value}
      onChange={handleChange}
      placeholder="R$ 0,00"
      className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-1.5 text-base sm:text-sm font-semibold shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono tabular-nums"
    />
  )
}
