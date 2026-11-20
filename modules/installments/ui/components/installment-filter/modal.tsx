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
    InstallmentFilterContext,
    InstallmentFilterValues,
    useDraftInstallmentFilters,
} from "./index";

export interface InstallmentFilterModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    filters: InstallmentFilterValues;
    onApply: (appliedFilters: InstallmentFilterValues) => void;
    onClear: () => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
}

export function InstallmentFilterModal({
    open,
    onOpenChange,
    filters,
    onApply,
    onClear,
    title = "Filtros de Parcelamentos",
    description = "Filtre seus parcelamentos por status e tipo.",
    children,
}: InstallmentFilterModalProps) {
    const { contextValue, handleClear, handleApply } = useDraftInstallmentFilters({
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

                <InstallmentFilterContext.Provider value={contextValue}>
                    <div className="flex flex-col gap-4 py-1 text-sm">
                        {children}
                    </div>
                </InstallmentFilterContext.Provider>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleClear}>
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
