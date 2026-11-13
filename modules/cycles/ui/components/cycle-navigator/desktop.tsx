"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CycleNavigatorProps } from "./types";
import { STATUS_BADGE_CLASSES } from "../cycle-summary/labels";

export function CycleNavigatorDesktop({
    title,
    status,
    canPrev,
    canNext,
    onPrev,
    onNext,
    isLoading = false,
    className,
}: CycleNavigatorProps) {
    const badgeClass = STATUS_BADGE_CLASSES[status.tone] ?? STATUS_BADGE_CLASSES.neutral;

    return (
        <div
            className={cn(
                "flex items-center justify-between gap-2 p-2 rounded-xl border border-border/80 bg-card shadow-2xs h-12 w-full",
                className
            )}
        >
            <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={!canPrev || isLoading}
                onClick={onPrev}
                aria-label="Ciclo anterior"
                className="size-8 shrink-0 text-muted-foreground hover:text-foreground cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
            >
                <ChevronLeft className="size-4" />
            </Button>

            <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
                {isLoading ? (
                    <>
                        <div className="h-4 w-48 rounded bg-muted/60 animate-pulse" />
                        <div className="h-5 w-24 rounded-full bg-muted/60 animate-pulse shrink-0" />
                    </>
                ) : (
                    <>
                        <span className="truncate text-sm font-medium text-foreground">
                            {title}
                        </span>
                        <span
                            className={cn(
                                "shrink-0 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
                                badgeClass
                            )}
                        >
                            {status.label}
                        </span>
                    </>
                )}
            </div>

            <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={!canNext || isLoading}
                onClick={onNext}
                aria-label="Próximo ciclo"
                className="size-8 shrink-0 text-muted-foreground hover:text-foreground cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
            >
                <ChevronRight className="size-4" />
            </Button>
        </div>
    );
}

