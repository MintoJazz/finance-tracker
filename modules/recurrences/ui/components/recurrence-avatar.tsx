import React from "react";
import { cn } from "@/lib/utils";
import { getCategoryTheme } from "@/modules/movements/ui/components/category-badge";
import { CategoryIcon } from "@/modules/movements/ui/components/category-badge/category-icon";
import type { RecurrenceListItem } from "@/modules/recurrences/models/schemas/recurrence-item.schema";

export interface RecurrenceAvatarProps {
    item: Pick<RecurrenceListItem, "icon" | "color" | "category" | "isActive">;
    size?: "sm" | "md" | "lg";
    className?: string;
}

const SIZE_CLASSES = {
    sm: "size-7 min-w-7 rounded-lg",
    md: "size-9 min-w-9 rounded-xl",
    lg: "size-11 min-w-11 rounded-xl",
} as const;

const ICON_SIZES = {
    sm: 14,
    md: 18,
    lg: 22,
} as const;

/**
 * Renderiza o avatar da recorrência utilizando o ícone e a paleta de cor da categoria.
 */
export function RecurrenceAvatar({
    item,
    size = "md",
    className,
}: RecurrenceAvatarProps) {
    const color = item.color ?? item.category?.color;
    const { palette, style: colorStyle } = getCategoryTheme(color);

    return (
        <div
            style={colorStyle}
            className={cn(
                "flex shrink-0 items-center justify-center transition-colors",
                palette
                    ? cn(palette.bg, palette.text)
                    : !colorStyle && "bg-muted/70 text-muted-foreground",
                SIZE_CLASSES[size],
                !item.isActive && "opacity-60",
                className
            )}
        >
            <CategoryIcon name={item.icon} size={ICON_SIZES[size]} />
        </div>
    );
}

