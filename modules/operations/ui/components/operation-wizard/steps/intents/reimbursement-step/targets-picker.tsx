"use client"

import * as React from "react"
import {
  EntityPicker,
  type EntityPickerItem,
} from "@/modules/operations/ui/components/entity-picker"
import { useOperationWizard } from "@/modules/operations/ui/components/operation-wizard/context"

export interface ReimbursementTargetsPickerProps {
  value?: readonly string[]
  onChange: (ids: string[]) => void
  variant: "carousel" | "grid"
  showIntentPills?: boolean
}

export function ReimbursementTargetsPicker({
  value = [],
  onChange,
  variant,
  showIntentPills = true,
}: ReimbursementTargetsPickerProps) {
  const { lookups, updateDraft } = useOperationWizard()

  const items = React.useMemo<EntityPickerItem<string>[]>(
    () =>
      lookups.reimbursementTargets.map((target) => {
        const defaultTypeLabel =
          target.type === "GROUP"
            ? `Grupo${
                target.members && target.members.length > 0
                  ? ` • ${target.members.length} integrantes (${target.members
                      .map((m) => m.name)
                      .join(", ")})`
                  : ""
              }`
            : "Amigo • Reembolso individual"
        return {
          id: target.id,
          title: target.name,
          subtitle: target.subtitle || defaultTypeLabel,
          icon:
            target.icon ?? (target.type === "GROUP" ? "Users" : "UserRound"),
          color: target.color,
          keywords: [
            target.name,
            target.subtitle ?? "",
            target.type.toLowerCase(),
            ...(target.members?.map((m) => m.name) ?? []),
          ],
        }
      }),
    [lookups.reimbursementTargets]
  )

  const handleSelect = (ids: string[]) => {
    onChange(ids)
    updateDraft({
      DEMO_REIMBURSEMENT: {
        targetIds: ids,
      },
    })
  }

  return (
    <EntityPicker<string>
      multiple
      items={items}
      value={value}
      onChange={handleSelect}
      variant={variant}
      searchPlaceholder="Buscar amigo ou grupo..."
      emptyMessage="Nenhum contato ou grupo encontrado"
    />
  )
}
