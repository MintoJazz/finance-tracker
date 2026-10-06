"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { WalletMovementFilterForm } from "./wallet-movement-filter-form";
import { WalletMovementFilters } from "../../core/schemas/wallet-movement.schema";

interface WalletMovementFilterDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    filters: WalletMovementFilters;
    onApply: (appliedFilters: WalletMovementFilters) => void;
    onClear: () => void;
    hideDateRange?: boolean; // <-- NOVO
}

export function WalletMovementFilterDrawer({
    open,
    onOpenChange,
    filters,
    onApply,
    onClear,
    hideDateRange = false,
}: WalletMovementFilterDrawerProps) {
    const [draftFilters, setDraftFilters] = useState<WalletMovementFilters>(filters);
    const [prevOpen, setPrevOpen] = useState(open);

    // Quando o drawer abre, sincroniza o rascunho com os filtros atuais da URL
    if (open !== prevOpen) {
        setPrevOpen(open);
        if (open) {
            setDraftFilters(filters);
        }
    }

    const handleFieldChange = (updates: Partial<WalletMovementFilters>) => {
        setDraftFilters((prev) => ({
            ...prev,
            ...updates,
        }));
    };

    const handleClearDraft = () => {
        const emptyFilters: WalletMovementFilters = {
            q: undefined,
            from: hideDateRange ? filters.from : undefined,
            to: hideDateRange ? filters.to : undefined,
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

    return (
        <Drawer
            open={open}
            onOpenChange={(isOpen) => {
                onOpenChange(isOpen);
            }}
            showSwipeHandle
        >
            <DrawerContent className="data-[swipe-axis=y]:[--drawer-content-max-height:calc(100dvh-calc(var(--drawer-inset,0px)*2))] max-h-[calc(100dvh-calc(var(--drawer-inset,0px)*2))]">
                <DrawerHeader>
                    <DrawerTitle>Filtros do Extrato</DrawerTitle>
                    <DrawerDescription>
                        Filtre as movimentações por período, tipo e direção.
                    </DrawerDescription>
                </DrawerHeader>

                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
                    <WalletMovementFilterForm
                        values={draftFilters}
                        onChange={handleFieldChange}
                        hideDateRange={hideDateRange}
                    />
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
