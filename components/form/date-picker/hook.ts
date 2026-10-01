"use client"

import * as React from "react"

import { formatDateToPTBR, maskDateString, parseDateFromPTBR } from "./utils"

interface UseDatePickerOptions {
  value?: Date | string
  onChange?: (date: Date | undefined) => void
}

function parseDateValue(value?: Date | string): Date | undefined {
  if (!value) return undefined
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? undefined : value
  }
  if (typeof value === "string") {
    const parsed = new Date(value)
    if (!isNaN(parsed.getTime())) {
      return parsed
    }
    const ptBrParsed = parseDateFromPTBR(value)
    if (ptBrParsed && !isNaN(ptBrParsed.getTime())) {
      return ptBrParsed
    }
  }
  return undefined
}

/** Estado e handlers do DatePicker (input com máscara + calendário) */
export function useDatePicker({ value, onChange }: UseDatePickerOptions) {
  const initialDate = parseDateValue(value)

  const [open, setOpen] = React.useState(false)
  const [month, setMonth] = React.useState<Date | undefined>(initialDate)
  const [inputValue, setInputValue] = React.useState(formatDateToPTBR(initialDate))

  // Sincroniza quando o valor muda por fora (ex.: form.reset)
  React.useEffect(() => {
    const parsed = parseDateValue(value)
    if (parsed) {
      setInputValue(formatDateToPTBR(parsed))
      setMonth(parsed)
    } else if (!value) {
      setInputValue("")
    }
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskDateString(e.target.value)
    setInputValue(masked)

    if (masked.length === 10) {
      const parsed = parseDateFromPTBR(masked)
      if (parsed) {
        onChange?.(parsed)
        setMonth(parsed)
      }
    } else if (masked.length === 0) {
      onChange?.(undefined)
    }
  }

  const handleSelectCalendar = (date: Date | undefined) => {
    if (!date) return
    onChange?.(date)
    setInputValue(formatDateToPTBR(date))
    setMonth(date)
    setOpen(false)
  }

  return {
    open,
    setOpen,
    month,
    setMonth,
    inputValue,
    handleInputChange,
    handleSelectCalendar,
  }
}