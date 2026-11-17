"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
    WEEKDAY_ORDER,
    weekdayShort,
} from "@/modules/recurrences/ui/utils/recurrence-form.utils";

interface Props extends Omit<React.ComponentProps<"div">, "onChange"> {
    value?: number | null;
    onChange: (value: number) => void;
}

export function RecurrenceWeekdayPicker({
    value,
    onChange,
    className,
    ...props
}: Props) {
    return (
        <div
            role="radiogroup"
            className={cn("grid grid-cols-7 gap-1.5", className)}
            {...props}
        >
            {WEEKDAY_ORDER.map((day) => {
                const active = value === day;
                return (
                    <button
                        key={day}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => onChange(day)}
                        className={cn(
                            "h-9 rounded-lg border border-input text-xs font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                            active
                                ? "border-foreground/80 bg-foreground/10 text-foreground ring-1 ring-foreground/20"
                                : "text-muted-foreground hover:bg-muted/50"
                        )}
                    >
                        {weekdayShort(day)}
                    </button>
                );
            })}
        </div>
    );
}
