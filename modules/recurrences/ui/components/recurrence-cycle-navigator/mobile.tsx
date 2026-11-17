"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { cn } from "@/lib/utils";
import { DateRangeDrawer } from "./date-range-drawer";
import type { RecurrenceCycleNavigatorMobileProps } from "./types";

export function RecurrenceCycleNavigatorMobile({
    horizon,
    onPrev,
    onNext,
    isLoading = false,
    dateRange,
    onSelectDateRange,
    onResetDateRange,
    onOpenFilters,
    activeFilterCount = 0,
    className,
}: RecurrenceCycleNavigatorMobileProps) {
    const { canPrev, canNext, label, isCustom, hasPagination = true } = horizon;
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    return (
        <>
            <div
                className={cn(
                    "flex items-stretch backdrop-blur-xs h-10 w-full p-0",
                    className
                )}
            >
                <ButtonGroup className="w-full h-full flex items-stretch justify-between">
                    {/* 1. Botão de Prev (apenas se houver paginação) */}
                    {hasPagination && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={!canPrev || isLoading}
                            onClick={onPrev}
                            aria-label="Horizonte anterior"
                            className="h-full w-10 shrink-0 text-muted-foreground hover:text-foreground cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 rounded-none"
                        >
                            <ChevronLeft className="size-4" />
                        </Button>
                    )}

                    {/* 2. Botão com o Macro-Horizonte (abre DateRangeDrawer no mobile) */}
                    <Button
                        type="button"
                        variant="ghost"
                        disabled={isLoading}
                        onClick={() => setIsDrawerOpen(true)}
                        aria-label="Selecionar período do horizonte"
                        className={cn(
                            "h-full flex-1 min-w-0 justify-center px-2 font-semibold text-[14px] cursor-pointer select-none truncate rounded-none",
                            isCustom && "text-primary"
                        )}
                    >
                        {isLoading ? (
                            <span className="h-4 w-28 rounded bg-muted/60 animate-pulse" />
                        ) : (
                            <span className="truncate">{label}</span>
                        )}
                    </Button>

                    {/* 3. Botão para os Filtros (Mobile) */}
                    {onOpenFilters && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={onOpenFilters}
                            aria-label="Filtrar ciclos"
                            className="h-full w-10 shrink-0 text-muted-foreground hover:text-foreground cursor-pointer rounded-none relative"
                        >
                            <SlidersHorizontal className="size-4" />
                            {activeFilterCount > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="absolute top-1 right-1 h-3.5 min-w-3.5 px-0.5 text-[9px] font-bold flex items-center justify-center"
                                >
                                    {activeFilterCount}
                                </Badge>
                            )}
                        </Button>
                    )}

                    {/* 4. Botão de Next (apenas se houver paginação) */}
                    {hasPagination && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={!canNext || isLoading}
                            onClick={onNext}
                            aria-label="Próximo horizonte"
                            className="h-full w-10 shrink-0 text-muted-foreground hover:text-foreground cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 rounded-none"
                        >
                            <ChevronRight className="size-4" />
                        </Button>
                    )}
                </ButtonGroup>
            </div>

            {/* Drawer de Date Range Picker padronizado */}
            <DateRangeDrawer
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                horizon={horizon}
                dateRange={dateRange}
                onSelectDateRange={onSelectDateRange}
                onResetDateRange={onResetDateRange}
            />
        </>
    );
}

export default RecurrenceCycleNavigatorMobile;
