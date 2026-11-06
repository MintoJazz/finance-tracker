"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { useOperationWizard } from "../../../context"

export interface OperationDescriptionInputProps {
  value?: string
  onChange?: (val: string) => void
  showIntentPills?: boolean
}

export function OperationDescriptionInput({
  value,
  onChange,
}: OperationDescriptionInputProps) {
  const { updateDraft } = useOperationWizard()

  return (
    <Input
      value={value ?? ""}
      onChange={(e) => {
        const next = e.target.value
        onChange?.(next)
        updateDraft({
          base: {
            description: next,
          },
        })
      }}
      placeholder="Ex: Supermercado, Aluguel, Consultoria..."
      autoComplete="off"
      className="h-9 text-base sm:text-sm"
    />
  )
}
