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
import type { DatePickerProps } from "./types"

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ value, onChange, className, ...props }, ref) => {
    const {
      open,
      setOpen,
      month,
      setMonth,
      inputValue,
      handleInputChange,
      handleSelectCalendar,
    } = useDatePicker({ value, onChange })

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
                selected={value instanceof Date ? value : undefined}
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
)

DatePicker.displayName = "DatePicker"