"use client";

import React, { createContext, useContext, useMemo } from "react";
import { format, parse } from "date-fns";
import { DateRange } from "react-day-picker";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { DateRangePicker } from "@/components/form/date-picker/date-range";
import {
    BadgeCarousel,
    BadgeCarouselContent,
    BadgeCarouselControls,
} from "@/components/form/carousel";
import {
    WalletMovementFilters,
    WalletMovementType,
} from "@/modules/ledger/core/schemas/wallet-movement.schema";
import { MOVEMENT_DIRECTION_THEMES } from "@/modules/ledger/ui/themes/movement-direction";

const MOVEMENT_TYPE_OPTIONS: { type: WalletMovementType; label: string }[] = [
    { type: "INCOME", label: "Receita" },
    { type: "EXPENSE", label: "Despesa" },
    { type: "TRANSFER", label: "Transferência" },
    { type: "ADJUSTMENT", label: "Ajuste" },
    { type: "REVERSAL", label: "Estorno" },
];

export interface MovementFilterContextValue {
    values: WalletMovementFilters;
    onChange: (updates: Partial<WalletMovementFilters>) => void;
    onReset?: () => void;
}

export const MovementFilterContext = createContext<MovementFilterContextValue | null>(null);

export function useMovementFilter() {
    const context = useContext(MovementFilterContext);
    if (!context) {
        throw new Error("useMovementFilter deve ser usado dentro de um MovementFilter.");
    }
    return context;
}

interface MovementFilterRootProps {
    values: WalletMovementFilters;
    onChange: (updates: Partial<WalletMovementFilters>) => void;
    onReset?: () => void;
    children: React.ReactNode;
    className?: string;
}

export function MovementFilterRoot({
    values,
    onChange,
    onReset,
    children,
    className,
}: MovementFilterRootProps) {
    const contextValue = useMemo(
        () => ({ values, onChange, onReset }),
        [values, onChange, onReset]
    );

    return (
        <MovementFilterContext.Provider value={contextValue}>
            <div className={cn("flex flex-col gap-4 text-sm", className)}>
                {children}
            </div>
        </MovementFilterContext.Provider>
    );
}

export function MovementFilterDirection({ className }: { className?: string }) {
    const { values, onChange } = useMovementFilter();

    const handleDirectionChange = (val: string) => {
        if (val === "CREDIT" || val === "DEBIT") {
            onChange({ direction: val });
        } else {
            onChange({ direction: undefined });
        }
    };

    return (
        <div className={cn("flex flex-col gap-1.5", className)}>
            <span className="text-xs font-medium text-muted-foreground">Direção</span>
            <ToggleGroup
                variant="outline"
                value={values.direction ? [values.direction] : ["ALL"]}
                onValueChange={(val: string[]) => {
                    const next = val.at(-1) ?? "ALL";
                    handleDirectionChange(next);
                }}
                className="w-full grid grid-cols-3"
            >
                {(
                    Object.entries(MOVEMENT_DIRECTION_THEMES) as [
                        string,
                        { label: string },
                    ][]
                ).map(([key, { label }]) => (
                    <ToggleGroupItem
                        key={key}
                        value={key}
                        className="text-xs h-7 justify-center"
                    >
                        {label}
                    </ToggleGroupItem>
                ))}
            </ToggleGroup>
        </div>
    );
}

export function MovementFilterDateRange({ className }: { className?: string }) {
    const { values, onChange } = useMovementFilter();

    const handleDateRangeChange = (range: DateRange | undefined) => {
        onChange({
            from: range?.from ? format(range.from, "yyyy-MM-dd") : undefined,
            to: range?.to ? format(range.to, "yyyy-MM-dd") : undefined,
        });
    };

    const dateRange: DateRange | undefined =
        values.from || values.to
            ? {
                  from: values.from
                      ? parse(values.from, "yyyy-MM-dd", new Date())
                      : undefined,
                  to: values.to
                      ? parse(values.to, "yyyy-MM-dd", new Date())
                      : undefined,
              }
            : undefined;

    return (
        <div className={cn("flex flex-col gap-1.5", className)}>
            <span className="text-xs font-medium text-muted-foreground">Período</span>
            <DateRangePicker value={dateRange} onChange={handleDateRangeChange} />
        </div>
    );
}

export function MovementFilterTypes({ className }: { className?: string }) {
    const { values, onChange } = useMovementFilter();

    return (
        <div className={cn("flex flex-col gap-1.5", className)}>
            <BadgeCarousel<WalletMovementType>
                options={MOVEMENT_TYPE_OPTIONS.map((opt) => ({
                    value: opt.type,
                    label: opt.label,
                }))}
                value={values.types}
                onChange={(types) =>
                    onChange({ types: types && types.length > 0 ? types : undefined })
                }
                multiple
            >
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                        Tipos de Movimentação
                    </span>
                    <BadgeCarouselControls className="hidden md:flex" />
                </div>
                <BadgeCarouselContent />
            </BadgeCarousel>
        </div>
    );
}

export function MovementFilterResetButton({ className }: { className?: string }) {
    const { values, onReset } = useMovementFilter();

    const hasActiveFilters = Boolean(
        (values.q && values.q.trim().length > 0) ||
            values.from ||
            values.to ||
            values.direction ||
            (values.types && values.types.length > 0)
    );

    if (!onReset || !hasActiveFilters) {
        return null;
    }

    return (
        <div className={cn("pt-1", className)}>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="text-xs text-muted-foreground hover:text-foreground h-8 w-full gap-1.5"
            >
                <X className="size-3.5" />
                Limpar todos os filtros
            </Button>
        </div>
    );
}

export const MovementFilter = Object.assign(MovementFilterRoot, {
    Direction: MovementFilterDirection,
    DateRange: MovementFilterDateRange,
    Types: MovementFilterTypes,
    ResetButton: MovementFilterResetButton,
});
