"use client"

import * as React from "react"
import type { OperationNature } from "@/modules/operations/models/operation-seed.schema"
import { EntityPickerItem, EntityPicker } from "../../../../entity-picker"
import { useOperationWizard } from "../../../context"

const NATURE_ITEMS: readonly EntityPickerItem<OperationNature>[] = [
  {
    id: "PAY",
    title: "Pagar",
    icon: "ArrowUpRight",
    color: "#EF4444",
    keywords: ["pagar", "despesa", "saida", "debito"],
  },
  {
    id: "RECEIVE",
    title: "Receber",
    icon: "ArrowDownLeft",
    color: "#10B981",
    keywords: ["receber", "receita", "entrada", "credito"],
  },
]

export interface NaturePickerProps {
  value?: OperationNature
  onChange: (value: OperationNature) => void
  variant: "carousel" | "grid"
}

export function NaturePicker({
  value = "PAY",
  onChange,
  variant,
}: NaturePickerProps) {
  const { draft, lookups, updateDraft } = useOperationWizard()

  const handleSelect = (next: OperationNature | null) => {
    if (!next) return
    onChange(next)

    const shouldResetCardCustody =
      next === "RECEIVE" && draft.base?.custodyType === "CREDIT"

    const currentCommitment = lookups.commitments.find(
      (c) => c.id === draft.DEMO_SETTLE?.commitmentId
    )
    const expectedBalanceType = next === "RECEIVE" ? "RECEIVABLE" : "PAYABLE"
    const shouldResetCommitment =
      currentCommitment !== undefined &&
      currentCommitment.balanceType !== expectedBalanceType

    updateDraft({
      nature: next,
      ...(shouldResetCardCustody
        ? {
            base: {
              custodyBalanceId: undefined,
              custodyType: "WALLET",
              competanceDate: null,
            },
          }
        : {}),
      ...(shouldResetCommitment
        ? {
            DEMO_SETTLE: {
              commitmentId: undefined,
            },
          }
        : {}),
    })
  }

  return (
    <EntityPicker<OperationNature>
      items={NATURE_ITEMS}
      value={value}
      onChange={handleSelect}
      variant={variant}
      searchable={false}
    />
  )
}
