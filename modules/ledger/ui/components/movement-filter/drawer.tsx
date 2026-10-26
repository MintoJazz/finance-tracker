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
import { WalletMovementFilters } from "@/modules/ledger/core/schemas/wallet-movement.schema";
import { MovementFilterContext } from "./index";

interface MovementFilterDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    filters: WalletMovementFilters;
    onApply: (appliedFilters: WalletMovementFilters) => void;
    onClear: () => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
}

export function MovementFilterDrawer({
    open,
    onOpenChange,
    filters,
    onApply,
    onClear,
    title = "Filtros",
    description = "Filtre os lançamentos por período, tipo e direção.",
    children,
}: MovementFilterDrawerProps) {
    const [draftFilters, setDraftFilters] = useState<WalletMovementFilters>(filters);
    const [prevOpen, setPrevOpen] = useState(open);

    if (open !== prevOpen) {
        setPrevOpen(open);
        if (open) {
            setDraftFilters(filters);
        }
    }

    const handleFieldChange = (updates: Partial<WalletMovementFilters>) => {
        setDraftFilters((prev: WalletMovementFilters) => ({
            ...prev,
            ...updates,
        }));
    };

    const handleClearDraft = () => {
        const emptyFilters: WalletMovementFilters = {
            q: undefined,
            from: filters.from,
            to: filters.to,
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
        }),
        [draftFilters]
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
