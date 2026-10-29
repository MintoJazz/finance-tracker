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
import { ContractCycleFiltersForm } from "./contract-cycle-filters-form";
import { ContractCycleFilters } from "@/modules/cycles/models/contract-cycle.schema";

interface ContractCycleFilterDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    filters: ContractCycleFilters;
    onApply: (appliedFilters: ContractCycleFilters) => void;
    onClear: () => void;
}

export function ContractCycleFilterDrawer({
    open,
    onOpenChange,
    filters,
    onApply,
    onClear,
}: ContractCycleFilterDrawerProps) {
    const [draftFilters, setDraftFilters] = useState<ContractCycleFilters>(filters);
    const [prevOpen, setPrevOpen] = useState(open);

    if (open !== prevOpen) {
        setPrevOpen(open);
        if (open) {
            setDraftFilters(filters);
        }
    }

    const handleFieldChange = (updates: Partial<ContractCycleFilters>) => {
        setDraftFilters((prev) => ({
            ...prev,
            ...updates,
        }));
    };

    const handleClearDraft = () => {
        const emptyFilters: ContractCycleFilters = {
            q: undefined,
            statuses: undefined,
            includeProjected: true,
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
            onOpenChange={onOpenChange}
            showSwipeHandle
        >
            <DrawerContent className="data-[swipe-axis=y]:[--drawer-content-max-height:calc(100dvh-calc(var(--drawer-inset,0px)*2))] max-h-[calc(100dvh-calc(var(--drawer-inset,0px)*2))]">
                <DrawerHeader>
                    <DrawerTitle>Filtros dos Ciclos</DrawerTitle>
                    <DrawerDescription>
                        Filtre os ciclos por status e projeção futura.
                    </DrawerDescription>
                </DrawerHeader>

                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
                    <ContractCycleFiltersForm
                        values={draftFilters}
                        onChange={handleFieldChange}
                        hideResetButton
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

export default ContractCycleFilterDrawer;
