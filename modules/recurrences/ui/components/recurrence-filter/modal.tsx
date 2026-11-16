"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    RecurrenceFilterContext,
    RecurrenceFilterValues,
    useDraftRecurrenceFilters,
} from "./index";

export interface RecurrenceFilterModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    filters: RecurrenceFilterValues;
    onApply: (appliedFilters: RecurrenceFilterValues) => void;
    onClear: () => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
}

export function RecurrenceFilterModal({
    open,
    onOpenChange,
    filters,
    onApply,
    onClear,
    title = "Filtros de Recorrências",
    description = "Filtre suas recorrências por direção, status e frequência.",
    children,
}: RecurrenceFilterModalProps) {
    const { contextValue, handleClear, handleApply } = useDraftRecurrenceFilters({
        open,
        onOpenChange,
        filters,
        onApply,
        onClear,
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <RecurrenceFilterContext.Provider value={contextValue}>
                    <div className="flex flex-col gap-4 py-1 text-sm">
                        {children}
                    </div>
                </RecurrenceFilterContext.Provider>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClear}
                    >
                        Limpar
                    </Button>
                    <Button type="button" onClick={handleApply}>
                        Aplicar filtros
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

