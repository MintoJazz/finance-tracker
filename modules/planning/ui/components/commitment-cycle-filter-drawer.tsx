"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { CommitmentCycleFilters } from "../../core/schemas/commitment-cycle.schema";
import { getPeriodPresetRange } from "../hooks/use-commitment-cycle-filters";
import { CommitmentCycleFilterForm } from "./commitment-cycle-filter-form";

interface CommitmentCycleFilterDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    filters: CommitmentCycleFilters;
    onApply: (appliedFilters: CommitmentCycleFilters) => void;
    onClear: () => void;
}

export function CommitmentCycleFilterDrawer({
    open,
    onOpenChange,
    filters,
    onApply,
    onClear,
}: CommitmentCycleFilterDrawerProps) {
    const [draftFilters, setDraftFilters] =
        React.useState<CommitmentCycleFilters>(filters);
    const [wasOpen, setWasOpen] = React.useState(open);

    // Sincroniza o rascunho exatamente quando o Drawer abre (sem useEffect)
    if (open && !wasOpen) {
        setWasOpen(true);
        setDraftFilters(filters);
    } else if (!open && wasOpen) {
        setWasOpen(false);
    }

    const handleFieldChange = (updates: Partial<CommitmentCycleFilters>) => {
        setDraftFilters((prev) => ({ ...prev, ...updates }));
    };

    const handleApply = () => {
        onApply(draftFilters);
        onOpenChange(false);
    };

    const handleClearDraft = () => {
        const defaultRange = getPeriodPresetRange("current_month");
        const resetFilters: CommitmentCycleFilters = {
            from: defaultRange.from,
            to: defaultRange.to,
            q: undefined,
            balanceTypes: undefined,
            statuses: undefined,
        };
        setDraftFilters(resetFilters);
        onClear();
        onOpenChange(false);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle>
            <DrawerContent>
                <div className="mx-auto w-full max-w-md overflow-y-auto px-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                    <DrawerHeader className="px-0 pt-3 pb-2 text-left">
                        <DrawerTitle className="text-base font-semibold">
                            Filtrar Compromissos
                        </DrawerTitle>
                        <DrawerDescription className="text-xs text-muted-foreground">
                            Ajuste o período de vencimento, origem ou status das obrigações.
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="py-2">
                        <CommitmentCycleFilterForm
                            values={draftFilters}
                            onChange={handleFieldChange}
                            hideResetButton
                        />
                    </div>

                    <DrawerFooter className="px-0 pt-4 pb-1 flex-row gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClearDraft}
                            className="flex-1 gap-1.5"
                        >
                            <RotateCcw className="size-3.5" />
                            Limpar
                        </Button>
                        <Button
                            type="button"
                            onClick={handleApply}
                            className="flex-1"
                        >
                            Aplicar filtros
                        </Button>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}

export default CommitmentCycleFilterDrawer;