"use client";

import * as React from "react";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RecurrenceFormValues } from "@/modules/recurrences/models/schemas/recurrence-form.schema";

type Direction = RecurrenceFormValues["direction"];

const OPTIONS: {
    value: Direction;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    activeClassName: string;
    iconClassName: string;
}[] = [
    {
        value: "DEBIT",
        label: "A Pagar (Despesa)",
        icon: ArrowUpRight,
        activeClassName: "border-red-500/60 bg-red-500/10 ring-1 ring-red-500/30",
        iconClassName: "text-red-500",
    },
    {
        value: "CREDIT",
        label: "A Receber (Receita)",
        icon: ArrowDownLeft,
        activeClassName:
            "border-emerald-500/60 bg-emerald-500/10 ring-1 ring-emerald-500/30",
        iconClassName: "text-emerald-500",
    },
];

interface Props extends Omit<React.ComponentProps<"div">, "onChange"> {
    value?: Direction;
    onChange: (value: Direction) => void;
}

export function RecurrenceNaturePicker({
    value,
    onChange,
    className,
    ...props
}: Props) {
    return (
        <div
            role="radiogroup"
            aria-label="Natureza da recorrência"
            className={cn("grid grid-cols-2 gap-2", className)}
            {...props}
        >
            {OPTIONS.map(({ value: v, label, icon: Icon, activeClassName, iconClassName }) => {
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
                                ? activeClassName
                                : "text-muted-foreground hover:bg-muted/50"
                        )}
                    >
                        <Icon className={cn("size-3.5 shrink-0", iconClassName)} />
                        <span className={cn("truncate", active && iconClassName)}>
                            {label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
