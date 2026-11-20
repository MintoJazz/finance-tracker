"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type {
    InstallmentFilters,
    InstallmentStatus,
    InstallmentType,
} from "@/modules/installments/models/schemas/installment-item.schema";
import {
    INSTALLMENT_STATUS_FILTER_THEMES,
    INSTALLMENT_TYPE_FILTER_THEMES,
} from "@/modules/installments/ui/themes/installment.themes";

export type InstallmentFilterValues = InstallmentFilters;

export interface InstallmentFilterContextValue {
    values: InstallmentFilterValues;
    onChange: (updates: Partial<InstallmentFilterValues>) => void;
    onReset?: () => void;
}

export const InstallmentFilterContext =
    createContext<InstallmentFilterContextValue | null>(null);

export function useInstallmentFilter() {
    const context = useContext(InstallmentFilterContext);
    if (!context) {
        throw new Error(
            "useInstallmentFilter deve ser usado dentro de um InstallmentFilter."
        );
    }
    return context;
}

/**
 * Hook compartilhado para controlar o estado de rascunho dos filtros no Drawer (mobile) e Modal (desktop).
 */
export function useDraftInstallmentFilters({
    open,
    onOpenChange,
    filters,
    onApply,
    onClear,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    filters: InstallmentFilterValues;
    onApply: (appliedFilters: InstallmentFilterValues) => void;
    onClear: () => void;
}) {
    const [draftFilters, setDraftFilters] =
        useState<InstallmentFilterValues>(filters);
    const [prevOpen, setPrevOpen] = useState(open);

    if (open !== prevOpen) {
        setPrevOpen(open);
        if (open) {
            setDraftFilters(filters);
        }
    }

    const handleFieldChange = useCallback(
        (updates: Partial<InstallmentFilterValues>) => {
            setDraftFilters((prev) => ({ ...prev, ...updates }));
        },
        []
    );

    const handleClear = useCallback(() => {
        const cleared: InstallmentFilterValues = {
            q: filters.q,
            status: "ALL",
            type: undefined,
        };
        setDraftFilters(cleared);
        onClear();
        onOpenChange(false);
    }, [filters.q, onClear, onOpenChange]);

    const handleApply = useCallback(() => {
        onApply(draftFilters);
        onOpenChange(false);
    }, [draftFilters, onApply, onOpenChange]);

    const contextValue = useMemo<InstallmentFilterContextValue>(
        () => ({ values: draftFilters, onChange: handleFieldChange }),
        [draftFilters, handleFieldChange]
    );

    return { contextValue, handleClear, handleApply };
}

export interface InstallmentFilterRootProps {
    values: InstallmentFilterValues;
    onChange: (updates: Partial<InstallmentFilterValues>) => void;
    onReset?: () => void;
    children: React.ReactNode;
    className?: string;
}

export function InstallmentFilterRoot({
    values,
    onChange,
    onReset,
    children,
    className,
}: InstallmentFilterRootProps) {
    const contextValue = useMemo<InstallmentFilterContextValue>(
        () => ({ values, onChange, onReset }),
        [values, onChange, onReset]
    );

    return (
        <InstallmentFilterContext.Provider value={contextValue}>
            <div className={cn("flex flex-col gap-4 text-sm", className)}>
                {children}
            </div>
        </InstallmentFilterContext.Provider>
    );
}

export function InstallmentFilterStatus({ className }: { className?: string }) {
    const { values, onChange } = useInstallmentFilter();

    const handleStatusChange = (val: string) => {
        if (
            val === "ACTIVE" ||
            val === "OVERDUE" ||
            val === "PAID" ||
            val === "ALL"
        ) {
            onChange({ status: val });
        } else {
            onChange({ status: "ALL" });
        }
    };

    return (
        <div className={cn("flex flex-col gap-1.5", className)}>
            <span className="text-xs font-medium text-muted-foreground">
                Status
            </span>
            <ToggleGroup
                variant="outline"
                value={[values.status ?? "ALL"]}
                onValueChange={(val: string[]) => {
                    handleStatusChange(val.at(-1) ?? "ALL");
                }}
                className="w-full grid grid-cols-4"
            >
                {(
                    Object.entries(INSTALLMENT_STATUS_FILTER_THEMES) as [
                        InstallmentStatus,
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

export function InstallmentFilterType({ className }: { className?: string }) {
    const { values, onChange } = useInstallmentFilter();

    const handleTypeChange = (val: string) => {
        if (val === "INVOICE" || val === "MONTHLY") {
            onChange({ type: val });
        } else {
            onChange({ type: undefined });
        }
    };

    return (
        <div className={cn("flex flex-col gap-1.5", className)}>
            <span className="text-xs font-medium text-muted-foreground">
                Tipo
            </span>
            <ToggleGroup
                variant="outline"
                value={values.type ? [values.type] : ["ALL"]}
                onValueChange={(val: string[]) => {
                    handleTypeChange(val.at(-1) ?? "ALL");
                }}
                className="w-full grid grid-cols-3"
            >
                {(
                    Object.entries(INSTALLMENT_TYPE_FILTER_THEMES) as [
                        InstallmentType | "ALL",
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

export const InstallmentFilter = Object.assign(InstallmentFilterRoot, {
    Status: InstallmentFilterStatus,
    Type: InstallmentFilterType,
});
