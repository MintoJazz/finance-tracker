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
    InstallmentFilterContext,
    InstallmentFilterValues,
    useDraftInstallmentFilters,
} from "./index";

export interface InstallmentFilterDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    filters: InstallmentFilterValues;
    onApply: (appliedFilters: InstallmentFilterValues) => void;
    onClear: () => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
}

export function InstallmentFilterDrawer({
    open,
    onOpenChange,
    filters,
    onApply,
    onClear,
    title = "Filtros de Parcelamentos",
    description = "Filtre seus parcelamentos por status e tipo.",
    children,
}: InstallmentFilterDrawerProps) {
    const { contextValue, handleClear, handleApply } = useDraftInstallmentFilters({
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
                    <InstallmentFilterContext.Provider value={contextValue}>
                        <div className="flex flex-col gap-4 text-sm">{children}</div>
                    </InstallmentFilterContext.Provider>
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
