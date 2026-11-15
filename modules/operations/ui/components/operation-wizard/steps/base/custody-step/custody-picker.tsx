"use client"

import * as React from "react"
import {
  EntityPicker,
  type EntityPickerItem,
} from "@/modules/operations/ui/components/entity-picker"
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

  const items = React.useMemo<EntityPickerItem<number>[]>(
    () =>
      lookups.custodies
        .filter((c) => (isReceive ? c.type !== "CREDIT" : true))
        .map((c) => {
          const typeLabel =
            c.type === "CREDIT"
              ? "Cartão de crédito"
              : c.type === "RESERVE"
                ? "Reserva"
                : "Carteira"

          return {
            id: c.id,
            title: c.name,
            subtitle: c.subtitle || typeLabel,
            icon:
              c.icon ??
              (c.type === "CREDIT"
                ? "CreditCard"
                : c.type === "RESERVE"
                  ? "PiggyBank"
                  : "Wallet"),
            color: c.color,
            keywords: [
              c.type.toLowerCase(),
              typeLabel.toLowerCase(),
              c.name,
              c.subtitle ?? "",
            ],
          }
        }),
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
    <EntityPicker<number>
      items={items}
      value={value}
      onChange={handleSelect}
      variant={variant}
      searchPlaceholder="Buscar meio de pagamento..."
      emptyMessage="Nenhum meio de pagamento encontrado"
    />
  )
}
