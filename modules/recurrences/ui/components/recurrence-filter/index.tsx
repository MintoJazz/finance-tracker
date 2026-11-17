"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type {
    RecurrenceDirection,
    RecurrenceFilters,
    RecurrenceFrequency,
    RecurrenceStatus,
} from "@/modules/recurrences/models/schemas/recurrence-item.schema";
import {
    RECURRENCE_DIRECTION_FILTER_THEMES,
    RECURRENCE_FREQUENCY_LABELS,
    RECURRENCE_STATUS_FILTER_THEMES,
} from "@/modules/recurrences/ui/themes/recurrence.themes";

export type RecurrenceFilterValues = RecurrenceFilters;

export interface RecurrenceFilterContextValue {
    values: RecurrenceFilterValues;
    onChange: (updates: Partial<RecurrenceFilterValues>) => void;
    onReset?: () => void;
}

export const RecurrenceFilterContext =
    createContext<RecurrenceFilterContextValue | null>(null);

export function useRecurrenceFilter() {
    const context = useContext(RecurrenceFilterContext);
    if (!context) {
        throw new Error(
            "useRecurrenceFilter deve ser usado dentro de um RecurrenceFilter."
        );
    }
    return context;
}

/**
 * Hook compartilhado para controlar o estado de rascunho dos filtros no Drawer (mobile) e Modal (desktop).
 */
export function useDraftRecurrenceFilters({
    open,
    onOpenChange,
    filters,
    onApply,
    onClear,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    filters: RecurrenceFilterValues;
    onApply: (appliedFilters: RecurrenceFilterValues) => void;
    onClear: () => void;
}) {
    const [draftFilters, setDraftFilters] = useState<RecurrenceFilterValues>(filters);
    const [prevOpen, setPrevOpen] = useState(open);

    if (open !== prevOpen) {
        setPrevOpen(open);
        if (open) {
            setDraftFilters(filters);
        }
    }

    const handleFieldChange = useCallback(
        (updates: Partial<RecurrenceFilterValues>) => {
            setDraftFilters((prev) => ({
                ...prev,
                ...updates,
            }));
        },
        []
    );

    const handleClear = useCallback(() => {
        const cleared: RecurrenceFilterValues = {
            q: filters.q,
            direction: undefined,
            active: "ALL",
            frequency: undefined,
        };
        setDraftFilters(cleared);
        onClear();
        onOpenChange(false);
    }, [filters.q, onClear, onOpenChange]);

    const handleApply = useCallback(() => {
        onApply(draftFilters);
        onOpenChange(false);
    }, [draftFilters, onApply, onOpenChange]);

    const contextValue = useMemo<RecurrenceFilterContextValue>(
        () => ({
            values: draftFilters,
            onChange: handleFieldChange,
        }),
        [draftFilters, handleFieldChange]
    );

    return {
        contextValue,
        handleClear,
        handleApply,
    };
}

export interface RecurrenceFilterRootProps {
    values: RecurrenceFilterValues;
    onChange: (updates: Partial<RecurrenceFilterValues>) => void;
    onReset?: () => void;
    children: React.ReactNode;
    className?: string;
}

export function RecurrenceFilterRoot({
    values,
    onChange,
    onReset,
    children,
    className,
}: RecurrenceFilterRootProps) {
    const contextValue = useMemo<RecurrenceFilterContextValue>(
        () => ({
            values,
            onChange,
            onReset,
        }),
        [values, onChange, onReset]
    );

    return (
        <RecurrenceFilterContext.Provider value={contextValue}>
            <div className={cn("flex flex-col gap-4 text-sm", className)}>
                {children}
            </div>
        </RecurrenceFilterContext.Provider>
    );
}

export function RecurrenceFilterDirection({ className }: { className?: string }) {
    const { values, onChange } = useRecurrenceFilter();

    const handleDirectionChange = (val: string) => {
        if (val === "CREDIT" || val === "DEBIT") {
            onChange({ direction: val });
        } else {
            onChange({ direction: undefined });
        }
    };

    return (
        <div className={cn("flex flex-col gap-1.5", className)}>
            <span className="text-xs font-medium text-muted-foreground">
                Direção
            </span>
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
                    Object.entries(RECURRENCE_DIRECTION_FILTER_THEMES) as [
                        RecurrenceDirection | "ALL",
                        { label: string },
                    ][]
                ).map(([key, { label }]) => (
                    <ToggleGroupItem
                        key={key}
                        value={key}
                        className="text-xs h-8 justify-center rounded-full"
                    >
                        {label}
                    </ToggleGroupItem>
                ))}
            </ToggleGroup>
        </div>
    );
}

export function RecurrenceFilterStatus({ className }: { className?: string }) {
    const { values, onChange } = useRecurrenceFilter();

    const handleStatusChange = (val: string) => {
        if (
            val === "ACTIVE" ||
            val === "OVERDUE" ||
            val === "INACTIVE" ||
            val === "ALL"
        ) {
            onChange({ active: val });
        } else {
            onChange({ active: "ALL" });
        }
    };

    return (
        <div className={cn("flex flex-col gap-1.5", className)}>
            <span className="text-xs font-medium text-muted-foreground">
                Status
            </span>
            <ToggleGroup
                variant="outline"
                value={[values.active ?? "ALL"]}
                onValueChange={(val: string[]) => {
                    const next = val.at(-1) ?? "ALL";
                    handleStatusChange(next);
                }}
                className="w-full grid grid-cols-4"
            >
                {(
                    Object.entries(RECURRENCE_STATUS_FILTER_THEMES) as [
                        RecurrenceStatus,
                        { label: string },
                    ][]
                ).map(([key, { label }]) => (
                    <ToggleGroupItem
                        key={key}
                        value={key}
                        className="text-xs h-8 px-1.5 justify-center rounded-full"
                    >
                        {label}
                    </ToggleGroupItem>
                ))}
            </ToggleGroup>
        </div>
    );
}

const FREQUENCY_OPTIONS: { value: RecurrenceFrequency | "ALL"; label: string }[] = [
    { value: "ALL", label: "Todas" },
    { value: "WEEKLY", label: RECURRENCE_FREQUENCY_LABELS.WEEKLY },
    { value: "MONTHLY", label: RECURRENCE_FREQUENCY_LABELS.MONTHLY },
    { value: "YEARLY", label: RECURRENCE_FREQUENCY_LABELS.YEARLY },
];

export function RecurrenceFilterFrequency({ className }: { className?: string }) {
    const { values, onChange } = useRecurrenceFilter();

    const handleFrequencyChange = (val: string) => {
        if (val === "WEEKLY" || val === "MONTHLY" || val === "YEARLY") {
            onChange({ frequency: val });
        } else {
            onChange({ frequency: undefined });
        }
    };

    return (
        <div className={cn("flex flex-col gap-1.5", className)}>
            <span className="text-xs font-medium text-muted-foreground">
                Frequência
            </span>
            <ToggleGroup
                variant="outline"
                value={values.frequency ? [values.frequency] : ["ALL"]}
                onValueChange={(val: string[]) => {
                    const next = val.at(-1) ?? "ALL";
                    handleFrequencyChange(next);
                }}
                className="w-full grid grid-cols-4"
            >
                {FREQUENCY_OPTIONS.map((option) => (
                    <ToggleGroupItem
                        key={option.value}
                        value={option.value}
                        className="text-xs h-8 px-1.5 justify-center rounded-full"
                    >
                        {option.label}
                    </ToggleGroupItem>
                ))}
            </ToggleGroup>
        </div>
    );
}

export const RecurrenceFilter = Object.assign(RecurrenceFilterRoot, {
    Direction: RecurrenceFilterDirection,
    Status: RecurrenceFilterStatus,
    Frequency: RecurrenceFilterFrequency,
});

