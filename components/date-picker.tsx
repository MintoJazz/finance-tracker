"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { ptBR } from "date-fns/locale"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const maskDateString = (value: string) => {
    const v = value.replace(/\D/g, "").slice(0, 8)
    if (v.length >= 5) return `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`
    if (v.length >= 3) return `${v.slice(0, 2)}/${v.slice(2)}`
    return v
}

const formatDateToPTBR = (date: Date | undefined) => {
    if (!date) return ""
    const d = date.getDate().toString().padStart(2, "0")
    const m = (date.getMonth() + 1).toString().padStart(2, "0")
    const y = date.getFullYear()
    return `${d}/${m}/${y}`
}

const parseDateFromPTBR = (str: string) => {
    if (str.length !== 10) return undefined
    const [d, m, y] = str.split("/")
    const date = new Date(Number(y), Number(m) - 1, Number(d))

    if (date.getDate() === Number(d) && date.getMonth() === Number(m) - 1) {
        return date
    }
    return undefined
}

export interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
    value?: Date | string;
    onChange?: (date: Date | undefined) => void;
}

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
    ({ value, onChange, className, ...props }, ref) => {
        const [open, setOpen] = React.useState(false)

        const initialDate = value instanceof Date ? value : undefined
        const [month, setMonth] = React.useState<Date | undefined>(initialDate)

        const [inputValue, setInputValue] = React.useState(formatDateToPTBR(initialDate))

        React.useEffect(() => {
            if (value instanceof Date) {
                setInputValue(formatDateToPTBR(value))
                setMonth(value)
            } else if (!value) {
                setInputValue("")
            }
        }, [value])

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const maskedValue = maskDateString(e.target.value)
            setInputValue(maskedValue)

            if (maskedValue.length === 10) {
                const parsedDate = parseDateFromPTBR(maskedValue)
                if (parsedDate) {
                    onChange?.(parsedDate)
                    setMonth(parsedDate)
                }
            } else if (maskedValue.length === 0) {
                // Se apagar tudo, limpa o estado
                onChange?.(undefined)
            }
        }

        const handleSelectCalendar = (date: Date | undefined) => {
            if (date) {
                onChange?.(date)
                setInputValue(formatDateToPTBR(date))
                setMonth(date)
                setOpen(false)
            }
        }

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
                        <PopoverTrigger asChild>
                            <InputGroupButton
                                variant="ghost"
                                size="icon-xs"
                                aria-label="Selecionar data"
                                tabIndex={-1}
                            >
                                <CalendarIcon className="h-4 w-4" />
                            </InputGroupButton>
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
export default DatePicker