"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type {
    RecurrenceFormFrequency,
    RecurrenceFormValues,
} from "@/modules/recurrences/models/schemas/recurrence-form.schema";
import { RECURRENCE_FORM_FREQUENCY_OPTIONS } from "@/modules/recurrences/ui/themes/recurrence.themes";
import { applyFrequencyDefaults } from "@/modules/recurrences/ui/utils/recurrence-form.utils";

interface Props extends Omit<React.ComponentProps<typeof SelectTrigger>, "onChange" | "value"> {
    value?: RecurrenceFormFrequency;
    onChange: (value: RecurrenceFormFrequency) => void;
}

/** Seleção de frequência em dropdown (form desktop). Ajusta os prazos ao trocar. */
export function RecurrenceFrequencySelect({ value, onChange, ...props }: Props) {
    const { setValue } = useFormContext<RecurrenceFormValues>();

    return (
        <Select
            value={value}
            items={RECURRENCE_FORM_FREQUENCY_OPTIONS}
            onValueChange={(next) => {
                if (!next) return;
                const freq = next as RecurrenceFormFrequency;
                applyFrequencyDefaults(freq, value, setValue);
                onChange(freq);
            }}
        >
            <SelectTrigger className="h-9 w-full" {...props}>
                <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
                {RECURRENCE_FORM_FREQUENCY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                        {o.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
