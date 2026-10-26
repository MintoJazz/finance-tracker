import React from "react";
import { ArrowRightLeft, CreditCard, Layers, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { MovementCategoryClassification } from "@/modules/ledger/core/schemas/wallet-movement.schema";
import { CategoryIcon } from "./category-icon";

export interface CategoryColorTheme {
    bg: string;
    text: string;
    border?: string;
}

export const CATEGORY_COLOR_PALETTES: Record<string, CategoryColorTheme> = {
    sky: {
        bg: "bg-sky-500/15 dark:bg-sky-500/20",
        text: "text-sky-600 dark:text-sky-400",
        border: "border-sky-500/30",
    },
    orange: {
        bg: "bg-orange-500/15 dark:bg-orange-500/20",
        text: "text-orange-600 dark:text-orange-400",
        border: "border-orange-500/30",
    },
    amber: {
        bg: "bg-amber-500/15 dark:bg-amber-500/20",
        text: "text-amber-600 dark:text-amber-400",
        border: "border-amber-500/30",
    },
    violet: {
        bg: "bg-violet-500/15 dark:bg-violet-500/20",
        text: "text-violet-600 dark:text-violet-400",
        border: "border-violet-500/30",
    },
    rose: {
        bg: "bg-rose-500/15 dark:bg-rose-500/20",
        text: "text-rose-600 dark:text-rose-400",
        border: "border-rose-500/30",
    },
    indigo: {
        bg: "bg-indigo-500/15 dark:bg-indigo-500/20",
        text: "text-indigo-600 dark:text-indigo-400",
        border: "border-indigo-500/30",
    },
    emerald: {
        bg: "bg-emerald-500/15 dark:bg-emerald-500/20",
        text: "text-emerald-600 dark:text-emerald-400",
        border: "border-emerald-500/30",
    },
    teal: {
        bg: "bg-teal-500/15 dark:bg-teal-500/20",
        text: "text-teal-600 dark:text-teal-400",
        border: "border-teal-500/30",
    },
    blue: {
        bg: "bg-blue-500/15 dark:bg-blue-500/20",
        text: "text-blue-600 dark:text-blue-400",
        border: "border-blue-500/30",
    },
    purple: {
        bg: "bg-purple-500/15 dark:bg-purple-500/20",
        text: "text-purple-600 dark:text-purple-400",
        border: "border-purple-500/30",
    },
    yellow: {
        bg: "bg-yellow-500/15 dark:bg-yellow-500/20",
        text: "text-yellow-600 dark:text-yellow-400",
        border: "border-yellow-500/30",
    },
    lime: {
        bg: "bg-lime-500/15 dark:bg-lime-500/20",
        text: "text-lime-600 dark:text-lime-400",
        border: "border-lime-500/30",
    },
    green: {
        bg: "bg-green-500/15 dark:bg-green-500/20",
        text: "text-green-600 dark:text-green-400",
        border: "border-green-500/30",
    },
    fuchsia: {
        bg: "bg-fuchsia-500/15 dark:bg-fuchsia-500/20",
        text: "text-fuchsia-600 dark:text-fuchsia-400",
        border: "border-fuchsia-500/30",
    },
    pink: {
        bg: "bg-pink-500/15 dark:bg-pink-500/20",
        text: "text-pink-600 dark:text-pink-400",
        border: "border-pink-500/30",
    },
    cyan: {
        bg: "bg-cyan-500/15 dark:bg-cyan-500/20",
        text: "text-cyan-600 dark:text-cyan-400",
        border: "border-cyan-500/30",
    },
    red: {
        bg: "bg-red-500/15 dark:bg-red-500/20",
        text: "text-red-600 dark:text-red-400",
        border: "border-red-500/30",
    },
    zinc: {
        bg: "bg-zinc-500/15 dark:bg-zinc-500/20",
        text: "text-zinc-600 dark:text-zinc-400",
        border: "border-zinc-500/30",
    },
    slate: {
        bg: "bg-slate-500/15 dark:bg-slate-500/20",
        text: "text-slate-600 dark:text-slate-400",
        border: "border-slate-500/30",
    },
};

export function getCategoryTheme(color?: string | null): {
    palette?: CategoryColorTheme;
    style?: { backgroundColor?: string; color?: string };
} {
    if (!color || typeof color !== "string") {
        return {};
    }

    const trimmedRaw = color.trim();
    const normalized = trimmedRaw.toLowerCase();
    const palette = CATEGORY_COLOR_PALETTES[normalized];
    if (palette) {
        return { palette };
    }

    if (trimmedRaw.startsWith("#")) {
        return {
            style: {
                backgroundColor: `${trimmedRaw}20`,
                color: trimmedRaw,
            },
        };
    }

    if (trimmedRaw.startsWith("hsl") || trimmedRaw.startsWith("rgb")) {
        return {
            style: {
                color: trimmedRaw,
            },
        };
    }

    return {};
}

export function getCategorySubtitle(
    classification?: MovementCategoryClassification | null
): string {
    if (!classification) return "Sem categoria";

    switch (classification.kind) {
        case "category":
            return classification.category.name;
        case "multiple":
            return "Múltiplas categorias";
        case "pass-through":
            return "Repasse / Transferência";
        case "credit-settlement":
            return classification.creditCard?.name
                ? `Fatura: ${classification.creditCard.name}`
                : "Pagamento de fatura";
        case "none":
        default:
            return "Sem categoria";
    }
}

export function getCategoryColorStyle(color?: string | null): {
    backgroundColor?: string;
    color?: string;
} {
    return getCategoryTheme(color).style ?? {};
}

interface CategoryAvatarProps {
    classification?: MovementCategoryClassification | null;
    size?: "sm" | "md" | "lg";
    className?: string;
}

export function CategoryAvatar({
    classification,
    size = "md",
    className,
}: CategoryAvatarProps) {
    const sizeClasses = {
        sm: "h-7 w-7 min-w-7 text-xs",
        md: "h-9 w-9 min-w-9 text-sm",
        lg: "h-11 w-11 min-w-11 text-base",
    }[size];

    const iconSizes = {
        sm: 14,
        md: 18,
        lg: 22,
    }[size];

    if (!classification || classification.kind === "none") {
        return (
            <div
                className={cn(
                    "flex items-center justify-center rounded-xl bg-muted/70 text-muted-foreground",
                    sizeClasses,
                    className
                )}
            >
                <Tag size={iconSizes} />
            </div>
        );
    }

    if (classification.kind === "category") {
        const color = classification.category.appearance?.color;
        const iconName = classification.category.appearance?.icon;
        const { palette, style: colorStyle } = getCategoryTheme(color);

        return (
            <div
                style={colorStyle}
                className={cn(
                    "flex items-center justify-center rounded-xl transition-colors",
                    palette
                        ? cn(palette.bg, palette.text)
                        : (!colorStyle && "bg-muted/70 text-foreground"),
                    sizeClasses,
                    className
                )}
            >
                <CategoryIcon name={iconName} size={iconSizes} />
            </div>
        );
    }

    if (classification.kind === "multiple") {
        return (
            <div
                className={cn(
                    "flex items-center justify-center rounded-xl bg-primary/10 text-primary",
                    sizeClasses,
                    className
                )}
            >
                <Layers size={iconSizes} />
            </div>
        );
    }

    if (classification.kind === "pass-through") {
        return (
            <div
                className={cn(
                    "flex items-center justify-center rounded-xl bg-blue-500/10 text-blue-500",
                    sizeClasses,
                    className
                )}
            >
                <ArrowRightLeft size={iconSizes} />
            </div>
        );
    }

    if (classification.kind === "credit-settlement") {
        return (
            <div
                className={cn(
                    "flex items-center justify-center rounded-xl bg-purple-500/10 text-purple-500",
                    sizeClasses,
                    className
                )}
            >
                <CreditCard size={iconSizes} />
            </div>
        );
    }

    return (
        <div
            className={cn(
                "flex items-center justify-center rounded-xl bg-muted/70 text-muted-foreground",
                sizeClasses,
                className
            )}
        >
            <Tag size={iconSizes} />
        </div>
    );
}

interface CategoryBadgeProps {
    classification?: MovementCategoryClassification | null;
    className?: string;
}

export function CategoryBadge({
    classification,
    className,
}: CategoryBadgeProps) {
    const subtitle = getCategorySubtitle(classification);
    const color =
        classification?.kind === "category"
            ? classification.category.appearance?.color
            : null;
    const { palette, style: colorStyle } = getCategoryTheme(color);

    return (
        <span
            style={colorStyle}
            className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium",
                palette
                    ? cn(palette.bg, palette.text, palette.border, "border")
                    : (!colorStyle && "bg-muted text-muted-foreground"),
                className
            )}
        >
            <CategoryAvatar
                classification={classification}
                size="sm"
                className="h-4 w-4 min-w-4 rounded-sm"
            />
            <span className="truncate max-w-35">{subtitle}</span>
        </span>
    );
}
