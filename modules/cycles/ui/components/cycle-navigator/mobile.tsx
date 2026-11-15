"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CycleNavigatorProps } from "./types";
import { STATUS_BADGE_CLASSES } from "../cycle-summary/labels";

export function CycleNavigatorMobile({
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
                "-mx-4 w-[calc(100%+2rem)] flex items-center justify-between p-2 px-6 border-y border-border/60 backdrop-blur-xs min-h-[58px]",
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

            <div className="flex min-w-0 flex-1 flex-col items-center justify-center px-1 text-center">
                {isLoading ? (
                    <>
                        <div className="h-4 w-40 rounded bg-muted/60 animate-pulse mb-1" />
                        <div className="h-4.5 w-24 rounded-full bg-muted/60 animate-pulse" />
                    </>
                ) : (
                    <>
                        <span className="w-full truncate text-[15px] font-medium text-foreground tracking-tight">
                            {title}
                        </span>
                        <div className="mt-1 flex justify-center">
                            <span
                                className={cn(
                                    "shrink-0 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium leading-none transition-colors",
                                    badgeClass
                                )}
                            >
                                {status.label}
                            </span>
                        </div>
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

