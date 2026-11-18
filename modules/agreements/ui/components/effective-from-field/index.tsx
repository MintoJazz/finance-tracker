"use client";

import { DatePicker } from "@/components/form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { FormField } from "@/types/form.types";
import {
    EFFECTIVE_MODE_OPTIONS,
    type EffectiveFromValues,
    type EffectiveMode,
} from "@/modules/agreements/models/effective-from.schema";
import {
    fromDateString,
    toDateString,
} from "@/modules/agreements/ui/utils/date-string";

interface EffectiveModeRadioProps {
    value?: EffectiveMode | null;
    onChange: (value: EffectiveMode) => void;
    idPrefix?: string;
}

export function EffectiveModeRadio({
    value,
    onChange,
    idPrefix = "effective-mode",
}: EffectiveModeRadioProps) {
    return (
        <RadioGroup
            value={value ?? ""}
            onValueChange={(next) => onChange(next as EffectiveMode)}
            className="gap-2.5"
        >
            {EFFECTIVE_MODE_OPTIONS.map((option) => {
                const id = `${idPrefix}-${option.value}`;
                return (
                    <div key={option.value} className="flex items-center gap-2">
                        <RadioGroupItem id={id} value={option.value} />
                        <Label htmlFor={id} className="cursor-pointer font-normal">
                            {option.label}
                        </Label>
                    </div>
                );
            })}
        </RadioGroup>
    );
}

/**
 * Campos "Quando começa a valer" compartilhados pelos formulários de ajuste
 * (CycleRule.effectiveFrom / AgreementAmountEntry.effectiveAt).
 */
export const effectiveFromFields: FormField<EffectiveFromValues>[] = [
    {
        name: "effectiveMode",
        label: "Quando começa a valer",
        children: (_ctx, field) => (
            <EffectiveModeRadio
                value={field.value as EffectiveMode | null}
                onChange={field.onChange}
            />
        ),
    },
    {
        name: "effectiveFrom",
        label: "A partir de",
        hidden: (values) => values.effectiveMode !== "DATE",
        children: (_ctx, field) => (
            <DatePicker
                value={fromDateString(field.value as string | null)}
                onChange={(date) => field.onChange(toDateString(date))}
                onBlur={field.onBlur}
            />
        ),
    },
];
