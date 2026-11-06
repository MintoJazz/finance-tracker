"use client"

import * as React from "react"
import { EntityPickerItem, EntityPicker } from "../../../../entity-picker"
import { useOperationWizard } from "../../../context"

export interface SubcategoryPickerProps {
  value?: number | null
  onChange: (id: number | null) => void
  variant: "carousel" | "grid"
}

export function SubcategoryPicker({
  value,
  onChange,
  variant,
}: SubcategoryPickerProps) {
  const { lookups, draft, updateDraft } = useOperationWizard()
  const parentCategoryId = draft.base?.categoryId

  const parentCategory = React.useMemo(
    () => lookups.categories.find((c) => c.id === parentCategoryId),
    [lookups.categories, parentCategoryId]
  )

  const items = React.useMemo<EntityPickerItem<number>[]>(() => {
    const filtered = parentCategoryId
      ? lookups.subcategories.filter((s) => s.parentId === parentCategoryId)
      : lookups.subcategories

    return filtered.map((sub) => ({
      id: sub.id,
      title: sub.name,
      subtitle: `Subcategoria de ${parentCategory?.name ?? sub.parentName ?? "Categoria"}`,
      icon: sub.icon ?? parentCategory?.icon ?? "Tag",
      color: sub.color ?? parentCategory?.color,
      keywords: [sub.name, parentCategory?.name ?? ""],
    }))
  }, [lookups.subcategories, parentCategoryId, parentCategory])

  const handleSelect = (id: number | null) => {
    onChange(id)
    updateDraft({
      base: {
        subcategoryId: id,
      },
    })
  }

  return (
    <EntityPicker<number>
      items={items}
      value={value}
      onChange={handleSelect}
      variant={variant}
      allowDeselect
      searchPlaceholder={
        parentCategory
          ? `Buscar subcategoria em ${parentCategory.name}...`
          : "Buscar subcategoria..."
      }
      emptyMessage="Nenhuma subcategoria encontrada"
    />
  )
}
