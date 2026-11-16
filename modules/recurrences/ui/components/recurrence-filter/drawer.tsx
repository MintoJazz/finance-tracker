"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import {
    RecurrenceFilterContext,
    RecurrenceFilterValues,
    useDraftRecurrenceFilters,
} from "./index";

export interface RecurrenceFilterDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    filters: RecurrenceFilterValues;
    onApply: (appliedFilters: RecurrenceFilterValues) => void;
    onClear: () => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
}

export function RecurrenceFilterDrawer({
    open,
    onOpenChange,
    filters,
    onApply,
    onClear,
    title = "Filtros de Recorrências",
    description = "Filtre suas recorrências por direção, status e frequência.",
    children,
}: RecurrenceFilterDrawerProps) {
    const { contextValue, handleClear, handleApply } = useDraftRecurrenceFilters({
        open,
        onOpenChange,
        filters,
        onApply,
        onClear,
    });

    return (
        <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle>
            <DrawerContent className="data-[swipe-axis=y]:[--drawer-content-max-height:calc(100dvh-calc(var(--drawer-inset,0px)*2))] max-h-[calc(100dvh-calc(var(--drawer-inset,0px)*2))]">
                <DrawerHeader>
                    <DrawerTitle>{title}</DrawerTitle>
                    <DrawerDescription>{description}</DrawerDescription>
                </DrawerHeader>

                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
                    <RecurrenceFilterContext.Provider value={contextValue}>
                        <div className="flex flex-col gap-4 text-sm">{children}</div>
                    </RecurrenceFilterContext.Provider>
                </div>

                <DrawerFooter className="flex-row gap-2 border-t pt-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClear}
                        className="flex-1"
                    >
                        Limpar
                    </Button>
                    <Button type="button" onClick={handleApply} className="flex-1">
                        Aplicar filtros
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}

