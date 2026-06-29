"use client"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { formatDate } from "@/lib/formatters"
import { CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

interface Props {
    date: DateRange | undefined
    setDate: (date: DateRange | undefined) => void
}

export default function DateRangeFilter({ date, setDate }: Props) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start px-2.5 font-normal w-full">
                    <CalendarIcon />
                    {date?.from ? (
                        date.to
                            ? <>{formatDate(date.from)} - {formatDate(date.to)}</>
                            : formatDate(date.from)
                    ) : (
                        <span className="text-muted-foreground">Período</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    required={false}
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                    captionLayout="dropdown"
                />
            </PopoverContent>
        </Popover>
    )
}