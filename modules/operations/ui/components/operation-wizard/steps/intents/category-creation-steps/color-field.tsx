"use client"

import * as React from "react"
import { CategoryColorPicker } from "@/modules/categories/ui/components/category-color-picker"
import { useOperationWizard } from "../../../context"

export interface CategoryCreationColorFieldProps {
  sliceKey: "CREATE_CATEGORY" | "CREATE_SUBCATEGORY"
  stepId: string
  value?: string | null
  onChange: (val: string | null) => void
  variant: "carousel" | "grid"
}

export function CategoryCreationColorField({
  sliceKey,
  value,
  onChange,
  variant,
}: CategoryCreationColorFieldProps) {
  const { updateDraft } = useOperationWizard()

  const handleSelect = (color: string | null) => {
    onChange(color)
    updateDraft({
      [sliceKey]: {
        color,
      },
      ...(sliceKey === "CREATE_CATEGORY"
        ? {
            CREATE_SUBCATEGORY: {
              color,
            },
          }
        : {}),
    })
  }

  return (
    <CategoryColorPicker
      value={value}
      onChange={handleSelect}
      variant={variant}
    />
  )
}
