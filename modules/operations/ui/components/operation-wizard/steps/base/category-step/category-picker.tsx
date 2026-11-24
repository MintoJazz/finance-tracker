"use client"

import * as React from "react"
import { CategoryEntityPicker } from "../../../../entity-picker"
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
    <CategoryEntityPicker
      categories={lookups.categories}
      subcategories={lookups.subcategories}
      value={value}
      onChange={handleSelect}
      variant={variant}
    />
  )
}
