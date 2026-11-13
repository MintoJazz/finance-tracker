"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { MovementEntryScope } from "@/modules/movements/models/movement-entry.schema";
import { MovementFilterContext, MovementFilterValues } from "./index";

export interface MovementFilterDrawerProps<T extends MovementFilterValues = MovementFilterValues> {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    filters: T;
    onApply: (appliedFilters: T) => void;
    onClear: () => void;
    scope?: MovementEntryScope;
    title?: string;
    description?: string;
    children: React.ReactNode;
}

export function MovementFilterDrawer<T extends MovementFilterValues = MovementFilterValues>({
    open,
    onOpenChange,
    filters,
    onApply,
    onClear,
    scope = "WALLET",
    title = "Filtros",
    description = "Filtre os lançamentos por período, tipo e direção.",
    children,
}: MovementFilterDrawerProps<T>) {
    const [draftFilters, setDraftFilters] = useState<T>(filters);
    const [prevOpen, setPrevOpen] = useState(open);

    if (open !== prevOpen) {
        setPrevOpen(open);
        if (open) {
            setDraftFilters(filters);
        }
    }

    const handleFieldChange = (updates: Partial<MovementFilterValues>) => {
        setDraftFilters((prev: T) => ({
            ...prev,
            ...updates,
        }));
    };

    const handleClearDraft = () => {
        const emptyFilters: T = {
            ...filters,
            q: undefined,
            direction: undefined,
            types: undefined,
            includeReversed: undefined,
        };
        setDraftFilters(emptyFilters);
        onClear();
        onOpenChange(false);
    };

    const handleApply = () => {
        onApply(draftFilters);
        onOpenChange(false);
    };

    const contextValue = useMemo(
        () => ({
            values: draftFilters,
            onChange: handleFieldChange,
            scope,
        }),
        [draftFilters, scope]
    );

    return (
        <Drawer
            open={open}
            onOpenChange={onOpenChange}
            showSwipeHandle
        >
            <DrawerContent className="data-[swipe-axis=y]:[--drawer-content-max-height:calc(100dvh-calc(var(--drawer-inset,0px)*2))] max-h-[calc(100dvh-calc(var(--drawer-inset,0px)*2))]">
                <DrawerHeader>
                    <DrawerTitle>{title}</DrawerTitle>
                    <DrawerDescription>{description}</DrawerDescription>
                </DrawerHeader>

                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
                    <MovementFilterContext.Provider value={contextValue}>
                        <div className="flex flex-col gap-4 text-sm">{children}</div>
                    </MovementFilterContext.Provider>
                </div>

                <DrawerFooter className="flex-row gap-2 border-t pt-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClearDraft}
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
