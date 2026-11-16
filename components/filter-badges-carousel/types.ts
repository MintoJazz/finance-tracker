import type { ComponentType, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export type FilterBadgeIcon =
    | LucideIcon
    | ComponentType<{ className?: string }>
    | ReactNode;

export interface FilterBadgeOption<TKey extends string = string> {
    key: TKey;
    label: ReactNode;
    prefix?: ReactNode;
    icon?: FilterBadgeIcon;
    onRemove: () => void;
    removeAriaLabel?: string;
}

export interface FilterBadgesCarouselProps<TKey extends string = string> {
    items: FilterBadgeOption<TKey>[];
    onClearAll?: () => void;
    clearAllLabel?: string;
    className?: string;
    itemClassName?: string;
}

