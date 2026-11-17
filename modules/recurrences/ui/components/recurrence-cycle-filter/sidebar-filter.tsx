"use client";

import React from "react";
import { Eye, EyeOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import {
    BadgeCarousel,
    BadgeCarouselContent,
    BadgeCarouselControls,
} from "@/components/form/carousel";
import { cn } from "@/lib/utils";
import type {
    RecurrenceCycleFilters,
    RecurrenceCycleStatusFilter,
} from "@/modules/recurrences/models/schemas/recurrence-cycle-filters.schema";

export interface RecurrenceCycleSidebarFilterProps {
    filters: RecurrenceCycleFilters;
    onApply: (updates: Partial<RecurrenceCycleFilters>) => void;
    onClear: () => void;
    className?: string;
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

export function RecurrenceCycleSidebarFilter({
    filters,
    onApply,
    onClear,
    className,
}: RecurrenceCycleSidebarFilterProps) {
    const hasActiveFilters =
        filters.status !== "ALL" || !filters.includeProjected;

    return (
        <div className={cn("flex flex-col gap-4 text-sm", className)}>
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Filtros dos ciclos
                </span>
                {hasActiveFilters && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onClear}
                        className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground gap-1 -mr-1 cursor-pointer"
                    >
                        <X className="size-3" />
                        Limpar filtros
                    </Button>
                )}
            </div>

            {/* Carrossel de Status com controles de setas */}
            <div className="flex flex-col gap-1.5">
                <BadgeCarousel<RecurrenceCycleStatusFilter>
                    options={STATUS_OPTIONS}
                    value={filters.status ?? "ALL"}
                    onChange={(val) => onApply({ status: val ?? "ALL" })}
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

            {/* Toggle Projetadas */}
            <div className="flex flex-col gap-1.5 pt-1">
                <span className="text-xs font-medium text-muted-foreground">
                    Ciclos Futuros
                </span>
                <Toggle
                    size="sm"
                    variant="outline"
                    pressed={Boolean(filters.includeProjected)}
                    onPressedChange={(pressed) =>
                        onApply({ includeProjected: pressed })
                    }
                    className="w-full justify-start text-xs h-9 px-3 gap-2 border-border/80"
                    aria-label="Incluir ciclos projetados"
                >
                    {filters.includeProjected ? (
                        <Eye className="size-4 text-primary" />
                    ) : (
                        <EyeOff className="size-4 text-muted-foreground" />
                    )}
                    <span>
                        {filters.includeProjected
                            ? "Exibindo projetadas"
                            : "Ocultando projetadas"}
                    </span>
                </Toggle>
            </div>
        </div>
    );
}

export default RecurrenceCycleSidebarFilter;
