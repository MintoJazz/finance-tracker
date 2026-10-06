"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { ptBR } from "date-fns/locale"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { formatDate } from "@/lib/formatters"
import { cn } from "@/lib/utils"

export interface DateRangePickerProps {
  id?: string
  name?: string
  value?: DateRange
  onChange?: (date: DateRange | undefined) => void
  onBlur?: () => void
  disabled?: boolean
  className?: string
  placeholder?: string
  numberOfMonths?: number
  ref?: React.Ref<HTMLButtonElement>
  "aria-invalid"?: boolean
}

export function DateRangePicker({
  id,
  name,
  value,
  onChange,
  onBlur,
  disabled,
  className,
  placeholder = "Selecionar período...",
  numberOfMonths = 2,
  ref,
  "aria-invalid": ariaInvalid,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (range: DateRange | undefined) => {
    onChange?.(range)
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      onBlur?.()
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <Button
            ref={ref}
            id={id}
            name={name}
            type="button"
            variant="outline"
            disabled={disabled}
            aria-invalid={ariaInvalid}
            className={cn(
              "w-full justify-start px-2.5 font-normal text-xs h-8 gap-1.5",
              !value?.from && "text-muted-foreground",
              className
            )}
          />
        }
      >
        <CalendarIcon className="size-3.5 shrink-0 text-muted-foreground" />
        {value?.from ? (
          value.to ? (
            <span className="truncate">
              {formatDate(value.from)} - {formatDate(value.to)}
            </span>
          ) : (
            <span>{formatDate(value.from)}</span>
          )
        ) : (
          <span>{placeholder}</span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          defaultMonth={value?.from}
          selected={value}
          onSelect={handleSelect}
          numberOfMonths={numberOfMonths}
          captionLayout="dropdown"
          locale={ptBR}
        />
      </PopoverContent>
    </Popover>
  )
}

export default DateRangePicker