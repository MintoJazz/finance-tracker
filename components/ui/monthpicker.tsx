"use client";
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "./button";
import { cn } from "@/lib/utils";

type Month = {
    number: number;
    name: string;
};

const MONTHS: Month[][] = [
    [
        { number: 0, name: "Jan" },
        { number: 1, name: "Feb" },
        { number: 2, name: "Mar" },
        { number: 3, name: "Apr" },
    ],
    [
        { number: 4, name: "May" },
        { number: 5, name: "Jun" },
        { number: 6, name: "Jul" },
        { number: 7, name: "Aug" },
    ],
    [
        { number: 8, name: "Sep" },
        { number: 9, name: "Oct" },
        { number: 10, name: "Nov" },
        { number: 11, name: "Dec" },
    ],
];

type MonthCalProps = {
    selectedMonth?: Date;
    onMonthSelect?: (date: Date) => void;
    onYearForward?: () => void;
    onYearBackward?: () => void;
    callbacks?: {
        yearLabel?: (year: number) => string;
        monthLabel?: (month: Month) => string;
    };
    variant?: {
        calendar?: {
            main?: ButtonVariant;
            selected?: ButtonVariant;
        };
        chevrons?: ButtonVariant;
    };
    minDate?: Date;
    maxDate?: Date;
    disabledDates?: Date[];
};

type ButtonVariant = "default" | "outline" | "ghost" | "link" | "destructive" | "secondary" | null | undefined;

function MonthPicker({
    onMonthSelect,
    selectedMonth,
    minDate,
    maxDate,
    disabledDates,
    callbacks,
    onYearBackward,
    onYearForward,
    variant,
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement> & MonthCalProps) {
    return (
        <div className={cn("w-[280px] p-3", className)} {...props}>
            <div className="w-full">
                <MonthCal
                    onMonthSelect={onMonthSelect}
                    callbacks={callbacks}
                    selectedMonth={selectedMonth}
                    onYearBackward={onYearBackward}
                    onYearForward={onYearForward}
                    variant={variant}
                    minDate={minDate}
                    maxDate={maxDate}
                    disabledDates={disabledDates}
                />
            </div>
        </div>
    );
}

function MonthCal({ selectedMonth, onMonthSelect, callbacks, variant, minDate, maxDate, disabledDates, onYearBackward, onYearForward }: MonthCalProps) {
    const [year, setYear] = React.useState<number>(selectedMonth?.getFullYear() ?? new Date().getFullYear());
    const [month, setMonth] = React.useState<number>(selectedMonth?.getMonth() ?? new Date().getMonth());
    const [menuYear, setMenuYear] = React.useState<number>(year);

    React.useEffect(() => {
        if (selectedMonth && !isNaN(selectedMonth.getTime())) {
            const nextYear = selectedMonth.getFullYear();
            const nextMonth = selectedMonth.getMonth();
            setYear(nextYear);
            setMonth(nextMonth);
            setMenuYear(nextYear);
        }
    }, [selectedMonth]);

    if (minDate && maxDate && minDate > maxDate) minDate = maxDate;

    const disabledDatesMapped = disabledDates?.map((d) => {
        return { year: d.getFullYear(), month: d.getMonth() };
    });

    const flatMonths = React.useMemo(() => MONTHS.flat(), []);

    return (
        <div className="flex flex-col space-y-3 w-full">
            <div className="flex justify-between items-center px-1">
                <button
                    type="button"
                    onClick={() => {
                        setMenuYear((prev) => prev - 1);
                        if (onYearBackward) onYearBackward();
                    }}
                    className={cn(
                        buttonVariants({ variant: variant?.chevrons ?? "outline", size: "icon" }),
                        "h-7 w-7 p-0 cursor-pointer"
                    )}
                    aria-label="Ano anterior"
                >
                    <ChevronLeft className="opacity-70 h-4 w-4" />
                </button>
                <div className="text-sm font-semibold tracking-wide select-none">
                    {callbacks?.yearLabel ? callbacks.yearLabel(menuYear) : menuYear}
                </div>
                <button
                    type="button"
                    onClick={() => {
                        setMenuYear((prev) => prev + 1);
                        if (onYearForward) onYearForward();
                    }}
                    className={cn(
                        buttonVariants({ variant: variant?.chevrons ?? "outline", size: "icon" }),
                        "h-7 w-7 p-0 cursor-pointer"
                    )}
                    aria-label="Próximo ano"
                >
                    <ChevronRight className="opacity-70 h-4 w-4" />
                </button>
            </div>

            <div className="grid grid-cols-4 gap-2 w-full">
                {flatMonths.map((m) => {
                    const isSelected = month === m.number && menuYear === year;
                    const isDisabled =
                        (maxDate
                            ? menuYear > maxDate.getFullYear() ||
                              (menuYear === maxDate.getFullYear() && m.number > maxDate.getMonth())
                            : false) ||
                        (minDate
                            ? menuYear < minDate.getFullYear() ||
                              (menuYear === minDate.getFullYear() && m.number < minDate.getMonth())
                            : false) ||
                        (disabledDatesMapped
                            ? disabledDatesMapped.some((d) => d.year === menuYear && d.month === m.number)
                            : false);

                    return (
                        <button
                            key={m.number}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => {
                                setMonth(m.number);
                                setYear(menuYear);
                                if (onMonthSelect) onMonthSelect(new Date(menuYear, m.number, 1));
                            }}
                            className={cn(
                                buttonVariants({
                                    variant: isSelected
                                        ? variant?.calendar?.selected ?? "default"
                                        : variant?.calendar?.main ?? "ghost",
                                }),
                                "h-9 w-full p-0 text-xs font-medium rounded-md transition-colors cursor-pointer select-none",
                                isSelected && "font-semibold shadow-xs"
                            )}
                        >
                            {callbacks?.monthLabel ? callbacks.monthLabel(m) : m.name}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

MonthPicker.displayName = "MonthPicker";

export { MonthPicker };
