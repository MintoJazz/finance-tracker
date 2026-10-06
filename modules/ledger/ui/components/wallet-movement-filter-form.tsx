"use client";

import { X } from "lucide-react";
import { format, parse } from "date-fns";
import { DateRangePicker } from "@/components/form/date-picker/date-range";
import {
    BadgeCarousel,
    BadgeCarouselContent,
    BadgeCarouselControls,
} from "@/components/form/carousel";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { WalletMovementType, WalletMovementFilters } from "../../core/schemas/wallet-movement.schema";

const MOVEMENT_TYPE_OPTIONS: { type: WalletMovementType; label: string }[] = [
    { type: "INCOME", label: "Receita" },
    { type: "EXPENSE", label: "Despesa" },
    { type: "TRANSFER", label: "Transferência" },
    { type: "ADJUSTMENT", label: "Ajuste" },
    { type: "REVERSAL", label: "Estorno" },
];

interface WalletMovementFilterFormProps {
    values: WalletMovementFilters;
    onChange: (updates: Partial<WalletMovementFilters>) => void;
    onReset?: () => void;
    className?: string;
    hideResetButton?: boolean;
    hideDateRange?: boolean; // <-- NOVO
}

export function WalletMovementFilterForm({
    values,
    onChange,
    onReset,
    className,
    hideResetButton = false,
    hideDateRange = false, // <-- NOVO
}: WalletMovementFilterFormProps) {


    const handleDirectionChange = (val: string) => {
        if (val === "CREDIT" || val === "DEBIT") {
            onChange({ direction: val });
        } else {
            onChange({ direction: undefined });
        }
    };

    const handleDateRangeChange = (range: DateRange | undefined) => {
        onChange({
            from: range?.from ? format(range.from, "yyyy-MM-dd") : undefined,
            to: range?.to ? format(range.to, "yyyy-MM-dd") : undefined,
        });
    };

    const hasActiveFilters = Boolean(
        (values.q && values.q.trim().length > 0) ||
        values.from ||
        values.to ||
        values.direction ||
        (values.types && values.types.length > 0)
    );

    const dateRange: DateRange | undefined = (values.from || values.to) ? {
        from: values.from ? parse(values.from, "yyyy-MM-dd", new Date()) : undefined,
        to: values.to ? parse(values.to, "yyyy-MM-dd", new Date()) : undefined,
    } : undefined;

    return (
        <div className={cn("flex flex-col gap-4 text-sm", className)}>

            {/* 2. Direção (Entradas / Saídas / Todas) */}
            <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">Direção</span>
                <ToggleGroup
                    variant="outline"
                    value={values.direction ? [values.direction] : ["ALL"]}
                    onValueChange={(val: string[]) => {
                        const next = val.at(-1) ?? "ALL";
                        handleDirectionChange(next);
                    }}
                    className="w-full grid grid-cols-3"
                >
                    <ToggleGroupItem value="ALL" className="text-xs h-7 justify-center">
                        Todas
                    </ToggleGroupItem>
                    <ToggleGroupItem value="CREDIT" className="text-xs h-7 justify-center">
                        Entradas
                    </ToggleGroupItem>
                    <ToggleGroupItem value="DEBIT" className="text-xs h-7 justify-center">
                        Saídas
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>

            {/* 3. Período (Data Inicial e Final) - oculto quando controlado por fatura */}
            {!hideDateRange && (
                <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-muted-foreground">Período</span>
                    <DateRangePicker value={dateRange} onChange={handleDateRangeChange} />
                </div>
            )}

            {/* 4. Tipos de Movimentação */}
            <BadgeCarousel<WalletMovementType>
                options={MOVEMENT_TYPE_OPTIONS.map((opt) => ({
                    value: opt.type,
                    label: opt.label,
                }))}
                value={values.types}
                onChange={(types) =>
                    onChange({ types: types && types.length > 0 ? types : undefined })
                }
                multiple
            >
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                        Tipos de Movimentação
                    </span>
                    <BadgeCarouselControls className="hidden md:flex" />
                </div>
                <BadgeCarouselContent />
            </BadgeCarousel>

            {/* 5. Ação de Limpar Filtros (quando houver filtros ativos, onReset fornecido e não oculto) */}
            {!hideResetButton && onReset && hasActiveFilters && (
                <div className="pt-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onReset}
                        className="text-xs text-muted-foreground hover:text-foreground h-8 w-full gap-1.5"
                    >
                        <X className="size-3.5" />
                        Limpar todos os filtros
                    </Button>
                </div>
            )}
        </div>
    );
}

