"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import type {
    RecurrenceFormFrequency,
    RecurrenceFormValues,
} from "@/modules/recurrences/models/schemas/recurrence-form.schema";
import { RECURRENCE_FORM_FREQUENCY_OPTIONS } from "@/modules/recurrences/ui/themes/recurrence.themes";
import { applyFrequencyDefaults } from "@/modules/recurrences/ui/utils/recurrence-form.utils";

interface Props extends Omit<React.ComponentProps<"div">, "onChange"> {
    value?: RecurrenceFormFrequency;
    onChange: (value: RecurrenceFormFrequency) => void;
}

/** Seleção de frequência em pílulas (wizard mobile). Ajusta os prazos ao trocar. */
export function RecurrenceFrequencyPills({
    value,
    onChange,
    className,
    ...props
}: Props) {
    const { setValue } = useFormContext<RecurrenceFormValues>();

    return (
        <div
            role="radiogroup"
            aria-label="Frequência"
            className={cn("flex flex-wrap gap-2", className)}
            {...props}
        >
            {RECURRENCE_FORM_FREQUENCY_OPTIONS.map(({ value: v, label }) => {
                const active = value === v;
                return (
                    <button
                        key={v}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => {
                            applyFrequencyDefaults(v, value, setValue);
                            onChange(v);
                        }}
                        className={cn(
                            "h-8 min-w-[5.5rem] flex-1 rounded-lg border border-input px-3 text-xs font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                            active
                                ? "border-foreground/80 bg-foreground/10 text-foreground ring-1 ring-foreground/20"
                                : "text-muted-foreground hover:bg-muted/50"
                        )}
                    >
                        {label}
                    </button>
                );
            })}
        </div>
    );
}
