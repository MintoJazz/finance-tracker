"use client"

import * as React from "react"
import { DatePicker } from "@/components/form/date-picker"
import { useOperationWizard } from "@/modules/operations/ui/components/operation-wizard/context"

export interface OperationDateInputProps {
  fieldKey: "dueDate" | "competanceDate"
  value?: string
  onChange?: (val: string) => void
}

function isoStringToLocalDate(value?: string): Date | undefined {
  if (!value) return undefined
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split("-").map(Number)
    return new Date(y, m - 1, d, 12, 0, 0)
  }
  const parsed = new Date(value)
  return isNaN(parsed.getTime()) ? undefined : parsed
}

function localDateToIsoString(date?: Date): string {
  if (!date || isNaN(date.getTime())) return ""
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function OperationDateInput({
  fieldKey,
  value,
  onChange,
}: OperationDateInputProps) {
  const { updateDraft } = useOperationWizard()

  const dateValue = React.useMemo(() => isoStringToLocalDate(value), [value])

  return (
    <DatePicker
      value={dateValue}
      onChange={(nextDate) => {
        const nextIso = localDateToIsoString(nextDate)
        onChange?.(nextIso)
        updateDraft({
          base: {
            [fieldKey]: nextIso,
          },
        })
      }}
      className="h-9 text-sm"
    />
  )
}
