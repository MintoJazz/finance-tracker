"use client"

import * as React from "react"
import { EntityPickerItem, EntityPicker } from "../../../../entity-picker"
import { useOperationWizard } from "../../../context"

export interface CyclePickerProps {
  value?: string | null
  onChange: (closingDate: string | null) => void
  variant: "carousel" | "grid"
}

export function CyclePicker({ value, onChange, variant }: CyclePickerProps) {
  const { lookups, draft, updateDraft } = useOperationWizard()
  const custodyId = draft.base?.custodyBalanceId

  const items = React.useMemo<EntityPickerItem<string>[]>(() => {
    const filtered = custodyId
      ? lookups.creditCycles.filter((c) => c.cardBalanceId === custodyId)
      : lookups.creditCycles

    return filtered.map((cycle) => ({
      id: cycle.closingDate,
      title: cycle.title,
      subtitle: cycle.subtitle,
      icon: cycle.status === "OPEN" ? "CalendarCheck" : "CalendarClock",
      color: cycle.status === "OPEN" ? "#10B981" : "#6366F1",
      keywords: [cycle.status.toLowerCase(), cycle.closingDate, cycle.dueDate],
    }))
  }, [lookups.creditCycles, custodyId])

  const handleSelect = (closingDate: string | null) => {
    onChange(closingDate)
    updateDraft({
      base: {
        competanceDate: closingDate,
      },
    })
  }

  return (
    <EntityPicker<string>
      items={items}
      value={value}
      onChange={handleSelect}
      variant={variant}
      searchPlaceholder="Buscar fatura..."
      emptyMessage="Nenhuma fatura encontrada para este cartão"
    />
  )
}
