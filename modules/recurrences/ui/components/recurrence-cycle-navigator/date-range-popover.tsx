"use client";

import React, { useState } from "react";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from "@/components/ui/popover";
import { formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { MacroHorizonInfo } from "@/modules/recurrences/models/schemas/recurrence-cycle-filters.schema";

export interface DateRangePopoverProps {
    horizon: MacroHorizonInfo;
    dateRange?: DateRange;
    onSelectDateRange: (range: DateRange | undefined) => void;
    onResetDateRange: () => void;
    isLoading?: boolean;
    className?: string;
}

export function DateRangePopover({
    horizon,
    dateRange,
    onSelectDateRange,
    onResetDateRange,
    isLoading = false,
    className,
}: DateRangePopoverProps) {
    const [open, setOpen] = useState(false);
    const [tempRange, setTempRange] = useState<DateRange | undefined>(dateRange);
    const [prevDateRange, setPrevDateRange] = useState(dateRange);

    if (dateRange !== prevDateRange) {
        setPrevDateRange(dateRange);
        setTempRange(dateRange);
    }

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen);
        if (nextOpen) {
            setTempRange(dateRange);
        }
    };

    const handleApply = () => {
        if (tempRange?.from && tempRange?.to) {
            onSelectDateRange(tempRange);
            setOpen(false);
        }
    };

    const handleReset = () => {
        onResetDateRange();
        setTempRange(undefined);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger
                render={
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isLoading}
                        aria-label="Selecionar período do horizonte"
                        className={cn(
                            "flex-1 min-w-0 justify-center px-3 font-semibold text-sm cursor-pointer select-none h-9 gap-1.5",
                            horizon.isCustom && "text-primary",
                            className
                        )}
                    />
                }
            >
                {isLoading ? (
                    <span className="h-4 w-32 rounded bg-muted/60 animate-pulse" />
                ) : (
                    <>
                        <CalendarIcon className="size-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{horizon.label}</span>
                        <ChevronDown className="size-3.5 text-muted-foreground shrink-0 opacity-70" />
                    </>
                )}
            </PopoverTrigger>

            <PopoverContent
                className="w-auto p-3 flex flex-col gap-3"
                align="center"
            >
                <PopoverHeader className="px-1">
                    <PopoverTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Período personalizado
                    </PopoverTitle>
                    <p className="text-xs text-foreground mt-0.5">
                        {tempRange?.from ? (
                            tempRange.to ? (
                                <span className="font-medium">
                                    {formatDate(tempRange.from)} até {formatDate(tempRange.to)}
                                </span>
                            ) : (
                                <span className="text-muted-foreground">
                                    Início: {formatDate(tempRange.from)} (selecione o fim)
                                </span>
                            )
                        ) : (
                            <span className="text-muted-foreground">
                                Selecione o intervalo de datas
                            </span>
                        )}
                    </p>
                </PopoverHeader>

                <Calendar
                    mode="range"
                    defaultMonth={tempRange?.from ?? new Date()}
                    selected={tempRange}
                    onSelect={setTempRange}
                    numberOfMonths={2}
                    captionLayout="dropdown"
                    locale={ptBR}
                />

                <div className="flex items-center justify-between gap-2 border-t border-border/50 pt-2 px-1">
                    {horizon.isCustom ? (
                        <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            onClick={handleReset}
                            className="text-muted-foreground hover:text-foreground cursor-pointer text-xs"
                        >
                            Restaurar padrão
                        </Button>
                    ) : (
                        <div />
                    )}

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={() => setOpen(false)}
                            className="cursor-pointer text-xs"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            variant="default"
                            size="xs"
                            disabled={!tempRange?.from || !tempRange?.to}
                            onClick={handleApply}
                            className="cursor-pointer text-xs"
                        >
                            Aplicar
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
