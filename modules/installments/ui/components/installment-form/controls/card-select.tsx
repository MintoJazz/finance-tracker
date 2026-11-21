"use client";

import * as React from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { InstallmentCard } from "@/modules/installments/models/schemas/installment-item.schema";

interface Props
    extends Omit<React.ComponentProps<typeof SelectTrigger>, "onChange" | "value"> {
    cards: InstallmentCard[];
    value?: number | null;
    onChange: (value: number) => void;
}

/** Seleção do cartão cuja fatura receberá as parcelas. */
export function InstallmentCardSelect({ cards, value, onChange, ...props }: Props) {
    const items = React.useMemo(
        () => cards.map((c) => ({ value: String(c.id), label: c.name })),
        [cards]
    );

    return (
        <Select
            value={value == null ? undefined : String(value)}
            items={items}
            onValueChange={(next) => {
                if (next) onChange(Number(next));
            }}
        >
            <SelectTrigger className="h-9 w-full" {...props}>
                <SelectValue placeholder="Selecione o cartão" />
            </SelectTrigger>
            <SelectContent>
                {items.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                        {o.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
