"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { getBalanceColorStyle, getInitials } from "@/lib/avatar-utils";

export interface BalanceAvatarProps {
    name: string;
    avatarUrl?: string | null;
    isArchived?: boolean;
    className?: string;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    shape?: "rounded" | "circle";
}

export { getBalanceColorStyle, getInitials, getHashColorStyle } from "@/lib/avatar-utils";

export default function BalanceAvatar({
    name,
    avatarUrl,
    isArchived,
    className,
    size = "md",
    shape = "rounded",
}: BalanceAvatarProps) {
    const [errorUrl, setErrorUrl] = React.useState<string | null>(null);
    const hasImageError = Boolean(avatarUrl && errorUrl === avatarUrl);
    const initials = getInitials(name || "U");
    const colorStyle = getBalanceColorStyle(name || "U");

    const sizeClasses = {
        xs: "size-6 text-[9px]",
        sm: "size-7 text-[10px]",
        md: "size-8 text-xs",
        lg: "size-9 text-sm",
        xl: "size-10 text-base",
    }[size];

    const shapeClasses = shape === "circle" ? "rounded-full" : "rounded-md";

    if (avatarUrl && !hasImageError) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                key={avatarUrl}
                src={avatarUrl}
                alt={name}
                onError={() => setErrorUrl(avatarUrl)}
                className={cn(
                    "flex shrink-0 items-center justify-center object-cover border select-none",
                    sizeClasses,
                    shapeClasses,
                    isArchived && "opacity-60",
                    className
                )}
            />
        );
    }

    return (
        <span
            style={colorStyle}
            className={cn(
                "flex shrink-0 items-center justify-center border font-medium select-none",
                sizeClasses,
                shapeClasses,
                isArchived && "opacity-60",
                className
            )}
        >
            {initials}
        </span>
    );
}

export { BalanceAvatar, BalanceAvatar as HashAvatar };
