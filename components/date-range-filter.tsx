"use client"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { formatarData } from "@/lib/formatters"
import { CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

interface Props {
    date: DateRange | undefined
    onSelect: (date: DateRange | undefined) => void
}

export default function DateRangeFilter({ date, onSelect }: Props) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start px-2.5 font-normal w-full">
                    <CalendarIcon />
                    {date?.from ? (
                        date.to
                            ? <>{formatarData(date.from)} - {formatarData(date.to)}</>
                            : formatarData(date.from)
                    ) : (
                        <span className="text-muted-foreground">Selecionar período</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    required={false}
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={onSelect}
                    numberOfMonths={2}
                    captionLayout="dropdown"
                />
            </PopoverContent>
        </Popover>
    )
}