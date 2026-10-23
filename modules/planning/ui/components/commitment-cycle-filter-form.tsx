// modules/planning/ui/components/commitment-cycle-filter-form.tsx
"use client";

import * as React from "react";
import type { DateRange } from "react-day-picker";
import { CreditCard, FileText, RotateCcw } from "lucide-react";
import {
    BadgeCarousel,
    BadgeCarouselContent,
    BadgeCarouselControls,
    type CarouselOption,
} from "@/components/form/carousel";
import { DateRangePicker } from "@/components/form/date-picker/date-range";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import {
    CommitmentCycleFilters,
    CommitmentCycleStatusEnum,
    CommitmentSourceTypeEnum,
} from "../../core/schemas/commitment-cycle.schema";
import {
    getPeriodPresetRange,
    PeriodPresetKey,
} from "../hooks/use-commitment-cycle-filters";

const PERIOD_PRESET_OPTIONS: CarouselOption<PeriodPresetKey>[] = [
    { value: "current_month", label: "Este mês" },
    { value: "next_30_days", label: "Próx. 30 dias" },
    { value: "next_3_months", label: "Próx. 3 meses" },
];

const STATUS_OPTIONS: CarouselOption<CommitmentCycleStatusEnum>[] = [
    { value: "PROJECTED", label: "Projetado" },
    { value: "OVERDUE", label: "Vencido" },
    { value: "PENDING", label: "A pagar" },
    { value: "PARTIAL", label: "Parcial" },
    { value: "OPEN", label: "Em aberto" },
    { value: "PAID", label: "Pago" },
];

function parseIsoDateLocal(isoStr?: string): Date | undefined {
    if (!isoStr) return undefined;
    const [y, m, d] = isoStr.split("-").map(Number);
    if (!y || !m || !d) return undefined;
    return new Date(y, m - 1, d);
}

function formatDateToIsoLocal(date?: Date): string | undefined {
    if (!date || Number.isNaN(date.getTime())) return undefined;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

interface CommitmentCycleFilterFormProps {
    values: CommitmentCycleFilters;
    onChange: (updates: Partial<CommitmentCycleFilters>) => void;
    onReset?: () => void;
    className?: string;
    hideResetButton?: boolean;
}

export function CommitmentCycleFilterForm({
    values,
    onChange,
    onReset,
    className,
    hideResetButton = false,
}: CommitmentCycleFilterFormProps) {
    const dateRange = React.useMemo<DateRange | undefined>(() => {
        const from = parseIsoDateLocal(values.from);
        const to = parseIsoDateLocal(values.to);
        if (!from && !to) return undefined;
        return { from, to };
    }, [values.from, values.to]);

    // Verifica se o intervalo atual bate com algum preset
    const activePreset = React.useMemo<PeriodPresetKey | undefined>(() => {
        for (const opt of PERIOD_PRESET_OPTIONS) {
            const range = getPeriodPresetRange(opt.value);
            if (range.from === values.from && range.to === values.to) {
                return opt.value;
            }
        }
        return undefined;
    }, [values.from, values.to]);

    const handlePresetChange = (preset: PeriodPresetKey | undefined) => {
        if (!preset) return;
        const range = getPeriodPresetRange(preset);
        onChange({ from: range.from, to: range.to });
    };

    const handleDateRangeChange = (range: DateRange | undefined) => {
        const nextFrom = formatDateToIsoLocal(range?.from);
        const nextTo = formatDateToIsoLocal(range?.to ?? range?.from);
        if (nextFrom && nextTo) {
            onChange({ from: nextFrom, to: nextTo });
        }
    };

    const sourceTypeValue = React.useMemo(() => {
        if (values.balanceTypes?.length !== 1) return "ALL";
        return values.balanceTypes[0];
    }, [values.balanceTypes]);

    const handleSourceTypeChange = (nextValues: string[]) => {
        const selected = nextValues[0];
        if (!selected || selected === "ALL") {
            onChange({ balanceTypes: undefined });
        } else {
            onChange({
                balanceTypes: [selected as CommitmentSourceTypeEnum],
            });
        }
    };

    return (
        <div className={cn("flex flex-col gap-3.5 w-full", className)}>
            {/* 1. Período de Vencimento + Presets Rápidos */}
            <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                    Período de vencimento
                </span>
                <DateRangePicker
                    value={dateRange}
                    onChange={handleDateRangeChange}
                />
                <BadgeCarousel<PeriodPresetKey>
                    multiple={false}
                    options={PERIOD_PRESET_OPTIONS}
                    value={activePreset}
                    onChange={handlePresetChange}
                    className="pt-0.5"
                >
                    <BadgeCarouselContent />
                </BadgeCarousel>
            </div>

            {/* 2. Tipo de Origem (Todos / Contratos / Cartões) */}
            <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                    Origem
                </span>
                <ToggleGroup
                    value={[sourceTypeValue]}
                    onValueChange={handleSourceTypeChange}
                    variant="outline"
                    size="sm"
                    className="w-full grid grid-cols-3"
                >
                    <ToggleGroupItem value="ALL" className="text-xs">
                        Todos
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value="COMMITMENT"
                        className="text-xs gap-1"
                    >
                        <FileText className="size-3.5 text-primary" />
                        Contratos
                    </ToggleGroupItem>
                    <ToggleGroupItem value="CREDIT" className="text-xs gap-1">
                        <CreditCard className="size-3.5 text-amber-500" />
                        Cartões
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>

            {/* 3. Status do Ciclo (BadgeCarousel Múltiplo) */}
            <BadgeCarousel<CommitmentCycleStatusEnum>
                multiple={true}
                options={STATUS_OPTIONS}
                value={values.statuses ?? []}
                onChange={(statuses) => onChange({ statuses })}
            >
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                        Status
                    </span>
                    <BadgeCarouselControls className="hidden sm:flex" />
                </div>
                <BadgeCarouselContent />
            </BadgeCarousel>

            {!hideResetButton && onReset && (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onReset}
                    className="w-full text-xs text-muted-foreground hover:text-foreground gap-1.5 mt-1"
                >
                    <RotateCcw className="size-3.5" />
                    Restaurar filtros padrão
                </Button>
            )}
        </div>
    );
}