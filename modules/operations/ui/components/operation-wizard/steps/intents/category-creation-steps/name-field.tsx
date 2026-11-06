"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { useOperationWizard } from "@/modules/operations/ui/components/operation-wizard/context"

export interface CategoryCreationNameFieldProps {
  sliceKey: "CREATE_CATEGORY" | "CREATE_SUBCATEGORY"
  stepId: string
  value?: string
  onChange: (val: string) => void
  placeholder: string
}

export function CategoryCreationNameField({
  sliceKey,
  value,
  onChange,
  placeholder,
}: CategoryCreationNameFieldProps) {
  const { updateDraft } = useOperationWizard()

  return (
    <Input
      value={value ?? ""}
      onChange={(e) => {
        const next = e.target.value
        onChange(next)
        updateDraft({
          [sliceKey]: {
            name: next,
          },
        })
      }}
      placeholder={placeholder}
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      className="h-9 text-base sm:text-sm"
    />
  )
}
