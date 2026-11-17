"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { cn } from "@/lib/utils";
import { DateRangePopover } from "./date-range-popover";
import type { RecurrenceCycleNavigatorDesktopProps } from "./types";

export function RecurrenceCycleNavigatorDesktop({
    horizon,
    onPrev,
    onNext,
    isLoading = false,
    dateRange,
    onSelectDateRange,
    onResetDateRange,
    className,
}: RecurrenceCycleNavigatorDesktopProps) {
    const { canPrev, canNext, hasPagination = true } = horizon;

    return (
        <ButtonGroup className={cn("w-full shadow-2xs", className)}>
            {hasPagination && (
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={!canPrev || isLoading}
                    onClick={onPrev}
                    aria-label="Horizonte anterior"
                    className="size-9 shrink-0 text-muted-foreground hover:text-foreground cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <ChevronLeft className="size-4" />
                </Button>
            )}

            <DateRangePopover
                horizon={horizon}
                dateRange={dateRange}
                onSelectDateRange={onSelectDateRange}
                onResetDateRange={onResetDateRange}
                isLoading={isLoading}
                className="h-9"
            />

            {hasPagination && (
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={!canNext || isLoading}
                    onClick={onNext}
                    aria-label="Próximo horizonte"
                    className="size-9 shrink-0 text-muted-foreground hover:text-foreground cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <ChevronRight className="size-4" />
                </Button>
            )}
        </ButtonGroup>
    );
}

export default RecurrenceCycleNavigatorDesktop;
