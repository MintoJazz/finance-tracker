"use client"

import * as React from "react"
import { formatMoney } from "@/lib/formatters"
import { EntityPickerItem, EntityPicker } from "../../../../entity-picker"
import { useOperationWizard } from "../../../context"

export interface CommitmentPickerProps {
  value?: number | null
  onChange: (id: number | null) => void
  variant: "carousel" | "grid"
}

export function CommitmentPicker({
  value,
  onChange,
  variant,
}: CommitmentPickerProps) {
  const { lookups, draft, updateDraft } = useOperationWizard()
  const expectedBalanceType =
    draft.nature === "RECEIVE" ? "RECEIVABLE" : "PAYABLE"

  const items = React.useMemo<EntityPickerItem<number>[]>(
    () =>
      lookups.commitments
        .filter((cm) => cm.balanceType === expectedBalanceType)
        .map((cm) => ({
          id: cm.id,
          title: cm.title,
          subtitle: `${cm.counterparty} • Vence em ${cm.dueDate} • ${formatMoney(cm.suggestedAmountCents)}`,
          icon: cm.icon ?? "CalendarClock",
          color: expectedBalanceType === "RECEIVABLE" ? "#10B981" : "#F59E0B",
          keywords: [cm.title, cm.counterparty, cm.dueDate],
        })),
    [lookups.commitments, expectedBalanceType]
  )

  const handleSelect = (id: number | null) => {
    onChange(id)
    const found = lookups.commitments.find((c) => c.id === id)
    updateDraft({
      DEMO_SETTLE: {
        commitmentId: id ?? undefined,
      },
      ...(found
        ? {
            base: {
              amount: found.suggestedAmountCents,
              description: found.title,
            },
          }
        : {}),
    })
  }

  return (
    <EntityPicker<number>
      items={items}
      value={value}
      onChange={handleSelect}
      variant={variant}
      searchPlaceholder="Buscar compromisso em aberto..."
      emptyMessage="Nenhum compromisso encontrado"
    />
  )
}
