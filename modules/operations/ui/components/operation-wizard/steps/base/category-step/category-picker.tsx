"use client"

import * as React from "react"
import { EntityPickerItem, EntityPicker } from "../../../../entity-picker"
import { useOperationWizard } from "../../../context"

export interface CategoryPickerProps {
  value?: number | null
  onChange: (id: number | null) => void
  variant: "carousel" | "grid"
}

export function CategoryPicker({
  value,
  onChange,
  variant,
}: CategoryPickerProps) {
  const { lookups, updateDraft } = useOperationWizard()

  const items = React.useMemo<EntityPickerItem<number>[]>(
    () =>
      lookups.categories.map((cat) => {
        const subNames = lookups.subcategories
          .filter((s) => s.parentId === cat.id)
          .map((s) => s.name)
        const subSummary =
          subNames.length > 0 ? ` • ${subNames.join(", ")}` : ""

        return {
          id: cat.id,
          title: cat.name,
          subtitle: subSummary ? `Subcategorias${subSummary}` : "Categoria raiz",
          icon: cat.icon ?? "Tag",
          color: cat.color,
          keywords: [cat.name, ...subNames],
        }
      }),
    [lookups.categories, lookups.subcategories]
  )

  const handleSelect = (id: number | null) => {
    onChange(id)
    updateDraft({
      base: {
        categoryId: id,
        subcategoryId: null,
      },
    })
  }

  return (
    <EntityPicker<number>
      items={items}
      value={value}
      onChange={handleSelect}
      variant={variant}
      searchPlaceholder="Buscar categoria..."
      emptyMessage="Nenhuma categoria encontrada"
    />
  )
}
