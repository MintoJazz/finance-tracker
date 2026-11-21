"use client";

import * as React from "react";
import { CreditCard, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InstallmentType } from "@/modules/installments/models/schemas/installment-item.schema";

const OPTIONS: {
    value: InstallmentType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}[] = [
    { value: "INVOICE", label: "Fatura do cartão", icon: CreditCard },
    { value: "MONTHLY", label: "Mês a mês", icon: CalendarDays },
];

interface Props extends Omit<React.ComponentProps<"div">, "onChange"> {
    value?: InstallmentType;
    onChange: (value: InstallmentType) => void;
}

/** Escolha de como o parcelamento é pago: na fatura de um cartão ou mês a mês. */
export function InstallmentTypePicker({
    value,
    onChange,
    className,
    ...props
}: Props) {
    return (
        <div
            role="radiogroup"
            aria-label="Forma de pagamento do parcelamento"
            className={cn("grid grid-cols-2 gap-2", className)}
            {...props}
        >
            {OPTIONS.map(({ value: v, label, icon: Icon }) => {
                const active = value === v;
                return (
                    <button
                        key={v}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => onChange(v)}
                        className={cn(
                            "flex h-9 items-center justify-center gap-2 rounded-lg border border-input px-2 text-xs font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                            active
                                ? "border-foreground/80 bg-foreground/10 text-foreground ring-1 ring-foreground/20"
                                : "text-muted-foreground hover:bg-muted/50"
                        )}
                    >
                        <Icon className="size-3.5 shrink-0" />
                        <span className="truncate">{label}</span>
                    </button>
                );
            })}
        </div>
    );
}
