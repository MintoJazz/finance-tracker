import type { ComponentType, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import type { VariantProps } from "class-variance-authority";
import type { badgeVariants } from "@/components/ui/badge";

export type FilterBadgeIcon =
    | LucideIcon
    | ComponentType<{ className?: string }>
    | ReactNode;

export interface FilterBadgeOption<TKey extends string = string> {
    key: TKey;
    label: ReactNode;
    prefix?: ReactNode;
    icon?: FilterBadgeIcon;
    variant?: VariantProps<typeof badgeVariants>["variant"];
    onRemove: () => void;
    removeAriaLabel?: string;
}

export interface FilterBadgesCarouselProps<TKey extends string = string> {
    items: FilterBadgeOption<TKey>[];
    onClearAll?: () => void;
    clearAllLabel?: string;
    variant?: VariantProps<typeof badgeVariants>["variant"];
    className?: string;
    itemClassName?: string;
}

