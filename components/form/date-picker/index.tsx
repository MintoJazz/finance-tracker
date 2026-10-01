"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { ptBR } from "date-fns/locale"

import { Calendar } from "@/components/ui/calendar"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

import { useDatePicker } from "./hook"

export interface DatePickerProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value?: Date | string
  onChange?: (date: Date | undefined) => void
  ref?: React.Ref<HTMLInputElement>
}

export function DatePicker({
  value,
  onChange,
  className,
  ref,
  ...props
}: DatePickerProps) {
  const {
    open,
    setOpen,
    month,
    setMonth,
    inputValue,
    handleInputChange,
    handleSelectCalendar,
  } = useDatePicker({ value, onChange })

  const parsedSelected = React.useMemo(() => {
    if (!value) return undefined
    if (value instanceof Date) return isNaN(value.getTime()) ? undefined : value
    if (typeof value === "string") {
      const d = new Date(value)
      if (!isNaN(d.getTime())) return d
    }
    return undefined
  }, [value])

  return (
    <InputGroup className={cn("w-full", className)}>
      <InputGroupInput
        {...props}
        ref={ref}
        type="text"
        inputMode="numeric"
        placeholder="dd/mm/aaaa"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault()
            setOpen(true)
          }
          props.onKeyDown?.(e)
        }}
      />
      <InputGroupAddon align="inline-end">
        <Popover open={open} onOpenChange={setOpen}>
          {/* Base UI: `render` evita <button> dentro de <button> */}
          <PopoverTrigger
            render={
              <InputGroupButton
                variant="ghost"
                size="icon-xs"
                aria-label="Selecionar data"
                tabIndex={-1}
              />
            }
          >
            <CalendarIcon className="h-4 w-4" />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={parsedSelected}
              month={month}
              onMonthChange={setMonth}
              onSelect={handleSelectCalendar}
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </InputGroupAddon>
    </InputGroup>
  )
}