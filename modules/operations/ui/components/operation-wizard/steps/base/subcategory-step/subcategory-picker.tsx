"use client"

import * as React from "react"
import { SubcategoryEntityPicker } from "../../../../entity-picker"
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
    () => lookups.categories.find((c) => c.id === parentCategoryId) ?? null,
    [lookups.categories, parentCategoryId]
  )

  const handleSelect = (id: number | null) => {
    onChange(id)
    updateDraft({
      base: {
        subcategoryId: id,
      },
    })
  }

  return (
    <SubcategoryEntityPicker
      subcategories={lookups.subcategories}
      parentCategory={parentCategory}
      value={value}
      onChange={handleSelect}
      variant={variant}
    />
  )
}
