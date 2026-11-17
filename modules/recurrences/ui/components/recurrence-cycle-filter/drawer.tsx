"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import {
    BadgeCarousel,
    BadgeCarouselContent,
    BadgeCarouselControls,
} from "@/components/form/carousel";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import type {
    RecurrenceCycleFilters,
    RecurrenceCycleStatusFilter,
} from "@/modules/recurrences/models/schemas/recurrence-cycle-filters.schema";

export interface RecurrenceCycleFilterDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    filters: RecurrenceCycleFilters;
    onApply: (appliedFilters: Partial<RecurrenceCycleFilters>) => void;
    onClear: () => void;
}

const STATUS_OPTIONS: Array<{
    value: RecurrenceCycleStatusFilter;
    label: string;
}> = [
    { value: "ALL", label: "Todos" },
    { value: "PENDING", label: "Pendentes" },
    { value: "PAID", label: "Pagos" },
    { value: "OVERDUE", label: "Atrasados" },
];

export function RecurrenceCycleFilterDrawer({
    open,
    onOpenChange,
    filters,
    onApply,
    onClear,
}: RecurrenceCycleFilterDrawerProps) {
    const [draftStatus, setDraftStatus] = useState<RecurrenceCycleStatusFilter>(
        filters.status ?? "ALL"
    );
    const [draftIncludeProjected, setDraftIncludeProjected] = useState<boolean>(
        Boolean(filters.includeProjected)
    );
    const [prevOpen, setPrevOpen] = useState(open);

    if (open !== prevOpen) {
        setPrevOpen(open);
        if (open) {
            setDraftStatus(filters.status ?? "ALL");
            setDraftIncludeProjected(Boolean(filters.includeProjected));
        }
    }

    const handleClear = () => {
        setDraftStatus("ALL");
        setDraftIncludeProjected(true);
        onClear();
        onOpenChange(false);
    };

    const handleApply = () => {
        onApply({
            status: draftStatus,
            includeProjected: draftIncludeProjected,
        });
        onOpenChange(false);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle>
            <DrawerContent className="data-[swipe-axis=y]:[--drawer-content-max-height:calc(100dvh-calc(var(--drawer-inset,0px)*2))] max-h-[calc(100dvh-calc(var(--drawer-inset,0px)*2))]">
                <DrawerHeader>
                    <DrawerTitle>Filtros dos Ciclos</DrawerTitle>
                    <DrawerDescription>
                        Filtre os ciclos por status ou alterne a exibição de ciclos projetados.
                    </DrawerDescription>
                </DrawerHeader>

                <div className="flex flex-col gap-4 px-4 py-3 min-h-0 overflow-y-auto">
                    {/* Status com carrossel de badges e setas */}
                    <div className="flex flex-col gap-1.5">
                        <BadgeCarousel<RecurrenceCycleStatusFilter>
                            options={STATUS_OPTIONS}
                            value={draftStatus}
                            onChange={(val) => setDraftStatus(val ?? "ALL")}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground">
                                    Status
                                </span>
                                <BadgeCarouselControls />
                            </div>
                            <BadgeCarouselContent />
                        </BadgeCarousel>
                    </div>

                    {/* Projetadas */}
                    <div className="flex flex-col gap-1.5 pt-1">
                        <span className="text-xs font-medium text-muted-foreground">
                            Ciclos Futuros
                        </span>
                        <Toggle
                            size="sm"
                            variant="outline"
                            pressed={draftIncludeProjected}
                            onPressedChange={setDraftIncludeProjected}
                            className="w-full justify-start text-xs h-10 px-3 gap-2 border-border/80"
                            aria-label="Incluir ciclos projetados"
                        >
                            {draftIncludeProjected ? (
                                <Eye className="size-4 text-primary" />
                            ) : (
                                <EyeOff className="size-4 text-muted-foreground" />
                            )}
                            <span>
                                {draftIncludeProjected
                                    ? "Exibindo projetadas"
                                    : "Ocultando projetadas"}
                            </span>
                        </Toggle>
                    </div>
                </div>

                <DrawerFooter className="flex-row gap-2 border-t pt-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClear}
                        className="flex-1 cursor-pointer"
                    >
                        Limpar
                    </Button>
                    <Button
                        type="button"
                        onClick={handleApply}
                        className="flex-1 cursor-pointer"
                    >
                        Aplicar filtros
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}

export default RecurrenceCycleFilterDrawer;
