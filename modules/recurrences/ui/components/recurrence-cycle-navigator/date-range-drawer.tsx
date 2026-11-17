"use client";

import React, { useState } from "react";
import { ptBR } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { formatDate } from "@/lib/formatters";
import type { MacroHorizonInfo } from "@/modules/recurrences/models/schemas/recurrence-cycle-filters.schema";

export interface DateRangeDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    horizon: MacroHorizonInfo;
    dateRange?: DateRange;
    onSelectDateRange: (range: DateRange | undefined) => void;
    onResetDateRange: () => void;
}

export function DateRangeDrawer({
    open,
    onOpenChange,
    dateRange,
    onSelectDateRange,
    onResetDateRange,
}: DateRangeDrawerProps) {
    const [tempRange, setTempRange] = useState<DateRange | undefined>(dateRange);
    const [prevOpen, setPrevOpen] = useState(open);
    const [prevDateRange, setPrevDateRange] = useState(dateRange);

    if (open !== prevOpen || dateRange !== prevDateRange) {
        setPrevOpen(open);
        setPrevDateRange(dateRange);
        if (open) {
            setTempRange(dateRange);
        }
    }

    const handleApply = () => {
        if (tempRange?.from && tempRange?.to) {
            onSelectDateRange(tempRange);
            onOpenChange(false);
        }
    };

    const handleClear = () => {
        onResetDateRange();
        setTempRange(undefined);
        onOpenChange(false);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle>
            <DrawerContent className="data-[swipe-axis=y]:[--drawer-content-max-height:calc(100dvh-calc(var(--drawer-inset,0px)*2))] max-h-[calc(100dvh-calc(var(--drawer-inset,0px)*2))]">
                <DrawerHeader>
                    <DrawerTitle>Filtrar por período</DrawerTitle>
                    <DrawerDescription>
                        {tempRange?.from ? (
                            tempRange.to ? (
                                <span className="text-foreground font-medium">
                                    {formatDate(tempRange.from)} a {formatDate(tempRange.to)}
                                </span>
                            ) : (
                                <span>A partir de {formatDate(tempRange.from)} (selecione o fim)</span>
                            )
                        ) : (
                            <span>Selecione a data inicial e final para os ciclos.</span>
                        )}
                    </DrawerDescription>
                </DrawerHeader>

                <div className="flex flex-col items-center gap-4 px-4 py-2 min-h-0 overflow-y-auto">
                    <Calendar
                        mode="range"
                        defaultMonth={tempRange?.from ?? new Date()}
                        selected={tempRange}
                        onSelect={setTempRange}
                        numberOfMonths={1}
                        captionLayout="dropdown"
                        locale={ptBR}
                        className="bg-transparent p-0 [--cell-size:--spacing(9)]"
                    />
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
                        disabled={!tempRange?.from || !tempRange?.to}
                        onClick={handleApply}
                        className="flex-1 cursor-pointer"
                    >
                        Aplicar período
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}

export default DateRangeDrawer;
