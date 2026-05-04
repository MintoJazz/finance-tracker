'use client'

import { CalendarIcon } from "lucide-react"
import { InputGroup, InputGroupAddon, InputGroupButton } from "./ui/input-group"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Calendar } from "./ui/calendar"
import { ptBR } from "date-fns/locale"
import { useState, useCallback } from "react"
import { useDateMaskSegmented } from "@/hooks/use-date-mask"

interface Props {
    date: Date | undefined
    setDate: (date: Date | undefined) => void
    className?: string
}

export default function DatePicker({ date, setDate, className }: Props) {
    const [open, setOpen] = useState<boolean>(false)
    const [month, setMonth] = useState<Date | undefined>(date)
    
    const handleDateChange = useCallback((newDate: Date | undefined) => {
        setDate(newDate)
        if (newDate) setMonth(newDate)
    }, [setDate])
    
    const dateMask = useDateMaskSegmented({
        date,
        onChange: handleDateChange
    })

    const handleKeyDown = (segment: 'day' | 'month' | 'year') => (e: React.KeyboardEvent<HTMLInputElement>) => {
        const result = dateMask[segment].onKeyDown(e)
        if (result === 'openCalendar') {
            setOpen(true)
        }
    }

    return (
        <InputGroup className={className}>
            <div className="flex h-full items-center gap-1 px-3 flex-1">
                <input
                    ref={dateMask.day.ref}
                    type="text"
                    inputMode="numeric"
                    value={dateMask.day.value}
                    onChange={dateMask.day.onChange}
                    onKeyDown={handleKeyDown('day')}
                    placeholder="dd"
                    className="w-6 bg-transparent text-center outline-none placeholder:text-muted-foreground"
                />
                <span className="text-muted-foreground">/</span>
                <input
                    ref={dateMask.month.ref}
                    type="text"
                    inputMode="numeric"
                    value={dateMask.month.value}
                    onChange={dateMask.month.onChange}
                    onKeyDown={handleKeyDown('month')}
                    placeholder="mm"
                    className="w-6 bg-transparent text-center outline-none placeholder:text-muted-foreground"
                />
                <span className="text-muted-foreground">/</span>
                <input
                    ref={dateMask.year.ref}
                    type="text"
                    inputMode="numeric"
                    value={dateMask.year.value}
                    onChange={dateMask.year.onChange}
                    onKeyDown={handleKeyDown('year')}
                    placeholder="aaaa"
                    className="w-10 bg-transparent text-center outline-none placeholder:text-muted-foreground"
                />
            </div>
            <InputGroupAddon align="inline-end">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <InputGroupButton variant="ghost" size="icon-xs">
                            <CalendarIcon />
                        </InputGroupButton>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar 
                            mode="single" 
                            selected={date} 
                            month={month} 
                            onMonthChange={setMonth} 
                            onSelect={(selectedDate) => {
                                if (selectedDate) {
                                    setDate(selectedDate)
                                    setOpen(false)
                                }
                            }}
                            locale={ptBR} 
                        />
                    </PopoverContent>
                </Popover>
            </InputGroupAddon>
        </InputGroup>
    )
}