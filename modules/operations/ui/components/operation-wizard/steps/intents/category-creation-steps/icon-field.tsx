"use client"

import * as React from "react"
import { CategoryIconPicker } from "@/modules/categories/ui/components/category-icon-picker"
import { useOperationWizard } from "@/modules/operations/ui/components/operation-wizard/context"

export interface CategoryCreationIconFieldProps {
  sliceKey: "CREATE_CATEGORY" | "CREATE_SUBCATEGORY"
  stepId: string
  value?: string | null
  onChange: (val: string | null) => void
  variant: "carousel" | "grid"
}

export function CategoryCreationIconField({
  sliceKey,
  value,
  onChange,
  variant,
}: CategoryCreationIconFieldProps) {
  const { draft, updateDraft } = useOperationWizard()
  const activeColor = draft[sliceKey]?.color ?? draft.CREATE_CATEGORY?.color

  const handleSelect = (icon: string | null) => {
    onChange(icon)
    updateDraft({
      [sliceKey]: {
        icon,
      },
    })
  }

  return (
    <CategoryIconPicker
      value={value}
      onChange={handleSelect}
      activeColor={activeColor}
      variant={variant}
      showLabel={false}
    />
  )
}
