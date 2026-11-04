"use client";

import * as React from "react";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
    ContractCycleFilters,
    ContractCycleStatusEnum,
} from "@/modules/cycles/models/contract-cycle.schema";
import { BadgeCarousel, BadgeCarouselContent, BadgeCarouselControls } from "@/components/form";

interface ContractCycleFiltersFormProps {
    values: ContractCycleFilters;
    onChange: (updates: Partial<ContractCycleFilters>) => void;
    onReset?: () => void;
    className?: string;
    hideResetButton?: boolean;
}

const STATUS_OPTIONS: { status: ContractCycleStatusEnum; label: string }[] = [
    { status: "PROJECTED", label: "Projetados" },
    { status: "PAID", label: "Pagos" },
    { status: "PENDING", label: "Pendentes" },
    { status: "OVERDUE", label: "Vencidos" },
    { status: "OPEN", label: "Em aberto" },
];

export function ContractCycleFiltersForm({
    values,
    onChange,
    onReset,
    className,
    hideResetButton = false,
}: ContractCycleFiltersFormProps) {
    const hasActiveFilters = Boolean(
        (values.q && values.q.trim().length > 0) ||
        (values.statuses && values.statuses.length > 0) ||
        values.includeProjected === false
    );

    return (
        <div className={cn("flex flex-col gap-4 text-sm", className)}>
            {/* 1. Status do Ciclo */}
            <BadgeCarousel<ContractCycleStatusEnum>
                options={STATUS_OPTIONS.map((opt) => ({
                    value: opt.status,
                    label: opt.label,
                }))}
                value={values.statuses}
                onChange={(types) =>
                    onChange({ statuses: types && types.length > 0 ? types : undefined })
                }
                multiple
            >
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                        Status do Ciclo
                    </span>
                    <BadgeCarouselControls className="hidden md:flex" />
                </div>
                <BadgeCarouselContent />
            </BadgeCarousel>

            {/* 3. Reset Button */}
            {!hideResetButton && hasActiveFilters && onReset && (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onReset}
                    className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground self-start"
                >
                    <X className="size-3.5" />
                    Limpar filtros
                </Button>
            )}
        </div>
    );
}

export default ContractCycleFiltersForm;
