"use client";

import * as React from "react";
import { X } from "lucide-react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FilterBadgeIcon, FilterBadgesCarouselProps } from "./types";

function renderBadgeIcon(icon: FilterBadgeIcon) {
    if (!icon) return null;

    if (React.isValidElement(icon)) {
        return icon;
    }

    if (
        typeof icon === "function" ||
        (typeof icon === "object" && icon !== null && "$$typeof" in icon)
    ) {
        const IconComponent = icon as React.ComponentType<{ className?: string }>;
        return <IconComponent className="size-3.5 shrink-0" />;
    }

    return icon as React.ReactNode;
}

/**
 * Carrossel horizontal genérico para exibição e remoção rápida de filtros ativos em formato de badges.
 * Oculta-se automaticamente quando não há itens ativos.
 */
export function FilterBadgesCarousel<TKey extends string = string>({
    items,
    onClearAll,
    clearAllLabel = "Limpar filtros",
    className,
    itemClassName,
}: FilterBadgesCarouselProps<TKey>) {
    const [api, setApi] = React.useState<CarouselApi>();
    const isDraggingRef = React.useRef(false);
    const pointerStartRef = React.useRef<{ x: number; y: number } | null>(null);

    React.useEffect(() => {
        if (!api) return;

        const onScroll = () => {
            isDraggingRef.current = true;
        };

        const onPointerDown = () => {
            isDraggingRef.current = false;
        };

        const onPointerUp = () => {
            setTimeout(() => {
                isDraggingRef.current = false;
            }, 150);
        };

        api.on("scroll", onScroll);
        api.on("pointerDown", onPointerDown);
        api.on("pointerUp", onPointerUp);

        return () => {
            api.off("scroll", onScroll);
            api.off("pointerDown", onPointerDown);
            api.off("pointerUp", onPointerUp);
        };
    }, [api]);

    const handlePointerDown = (e: React.PointerEvent) => {
        pointerStartRef.current = { x: e.clientX, y: e.clientY };
        isDraggingRef.current = false;
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!pointerStartRef.current) return;
        const dx = Math.abs(e.clientX - pointerStartRef.current.x);
        const dy = Math.abs(e.clientY - pointerStartRef.current.y);
        if (dx > 6 || dy > 6) {
            isDraggingRef.current = true;
        }
    };

    const handlePointerUp = () => {
        setTimeout(() => {
            isDraggingRef.current = false;
        }, 150);
        pointerStartRef.current = null;
    };

    if (items.length === 0) {
        return null;
    }

    return (
        <Carousel
            setApi={setApi}
            opts={{
                dragFree: true,
                containScroll: "trimSnaps",
                align: "start",
                watchDrag: true,
            }}
            data-slot="filter-badges-carousel"
            data-base-ui-swipe-ignore=""
            data-swipe-ignore=""
            data-vaul-no-drag=""
            className={cn("w-full min-w-0 select-none", className)}
            aria-label="Filtros ativos"
        >
            <CarouselContent
                data-slot="filter-badges-carousel-content"
                data-base-ui-swipe-ignore=""
                data-swipe-ignore=""
                data-vaul-no-drag=""
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                style={{ touchAction: "pan-y" }}
                className="-ml-1.5 py-0.5 select-none touch-pan-y cursor-grab active:cursor-grabbing"
            >
                {items.map((item) => (
                    <CarouselItem
                        key={item.key}
                        className="basis-auto shrink-0 pl-1.5"
                        data-slot="filter-badges-carousel-item"
                        data-base-ui-swipe-ignore=""
                        data-swipe-ignore=""
                        data-vaul-no-drag=""
                        style={{ touchAction: "pan-y" }}
                    >
                        <div
                            className={cn(
                                "inline-flex items-center gap-1.5 h-7 rounded-full border border-border/80 bg-secondary/60 px-2.5 text-xs text-foreground whitespace-nowrap",
                                itemClassName
                            )}
                        >
                            {item.icon && (
                                <span className="inline-flex shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-3.5">
                                    {renderBadgeIcon(item.icon)}
                                </span>
                            )}
                            {item.prefix && (
                                <span className="text-muted-foreground">
                                    {item.prefix}
                                </span>
                            )}
                            <span className="font-medium">{item.label}</span>
                            <button
                                type="button"
                                onClick={() => {
                                    if (isDraggingRef.current) return;
                                    item.onRemove();
                                }}
                                aria-label={
                                    item.removeAriaLabel ??
                                    `Remover filtro ${typeof item.label === "string" ? item.label : item.key}`
                                }
                                className="ml-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
                            >
                                <X className="size-3" />
                            </button>
                        </div>
                    </CarouselItem>
                ))}

                {onClearAll && items.length > 1 && (
                    <CarouselItem
                        key="__clear_all__"
                        className="basis-auto shrink-0 pl-1.5"
                        data-slot="filter-badges-carousel-clear"
                        data-base-ui-swipe-ignore=""
                        data-swipe-ignore=""
                        data-vaul-no-drag=""
                        style={{ touchAction: "pan-y" }}
                    >
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                if (isDraggingRef.current) return;
                                onClearAll();
                            }}
                            className="h-7 rounded-full px-2.5 text-xs text-muted-foreground hover:text-foreground"
                        >
                            {clearAllLabel}
                        </Button>
                    </CarouselItem>
                )}
            </CarouselContent>
        </Carousel>
    );
}

export * from "./types";

