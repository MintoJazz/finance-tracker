"use client"

import * as React from "react"
import { CustodyEntityPicker } from "@/modules/operations/ui/components/entity-picker"
import { useOperationWizard } from "@/modules/operations/ui/components/operation-wizard/context"

export interface CustodyPickerProps {
  value?: number | null
  onChange: (id: number | null) => void
  variant: "carousel" | "grid"
}

export function CustodyPicker({
  value,
  onChange,
  variant,
}: CustodyPickerProps) {
  const { lookups, draft, updateDraft } = useOperationWizard()
  const isReceive = draft.nature === "RECEIVE"

  const custodies = React.useMemo(
    () =>
      isReceive
        ? lookups.custodies.filter((c) => c.type !== "CREDIT")
        : lookups.custodies,
    [lookups.custodies, isReceive]
  )

  const handleSelect = (id: number | null) => {
    onChange(id)
    const found = lookups.custodies.find((c) => c.id === id)
    if (found) {
      updateDraft({
        base: {
          custodyBalanceId: found.id,
          custodyType: found.type,
          competanceDate: null,
        },
      })
    }
  }

  return (
    <CustodyEntityPicker
      custodies={custodies}
      value={value}
      onChange={handleSelect}
      variant={variant}
    />
  )
}
