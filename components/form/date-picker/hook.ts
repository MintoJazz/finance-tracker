"use client"

import * as React from "react"

import { formatDateToPTBR, maskDateString, parseDateFromPTBR } from "./utils"

interface UseDatePickerOptions {
  value?: Date | string
  onChange?: (date: Date | undefined) => void
}

/** Estado e handlers do DatePicker (input com máscara + calendário) */
export function useDatePicker({ value, onChange }: UseDatePickerOptions) {
  const initialDate = value instanceof Date ? value : undefined

  const [open, setOpen] = React.useState(false)
  const [month, setMonth] = React.useState<Date | undefined>(initialDate)
  const [inputValue, setInputValue] = React.useState(formatDateToPTBR(initialDate))

  // Sincroniza quando o valor muda por fora (ex.: form.reset)
  React.useEffect(() => {
    if (value instanceof Date) {
      setInputValue(formatDateToPTBR(value))
      setMonth(value)
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