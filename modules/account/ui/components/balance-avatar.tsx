import { CSSProperties } from "react";
import { cn } from "cn";

interface Props {
    name: string;
    isArchived?: boolean;
    className?: string;
    size?: "sm" | "md" | "lg";
}

export function getBalanceColorStyle(name: string): CSSProperties {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = Math.trunc((name.codePointAt(i) ?? 0) + ((hash << 5) - hash));
    }

    const hue = Math.abs(hash) % 360;

    return {
        backgroundColor: `oklch(0.65 0.18 ${hue} / 0.10)`,
        borderColor: `oklch(0.65 0.18 ${hue} / 0.25)`,
        color: `oklch(0.65 0.18 ${hue})`,
    };
}

export function getInitials(name: string) {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
        return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return name.trim().slice(0, 2).toUpperCase();
}

export default function BalanceAvatar({
    name,
    isArchived,
    className,
    size = "md",
}: Props) {
    const initials = getInitials(name);
    const colorStyle = getBalanceColorStyle(name);

    const sizeClasses = {
        sm: "size-7 text-[10px]",
        md: "size-8 text-xs",
        lg: "size-9 text-sm",
    }[size];

    return (
        <span
            style={colorStyle}
            className={cn(
                "flex shrink-0 items-center justify-center rounded-md border font-medium select-none",
                sizeClasses,
                isArchived && "opacity-60",
                className
            )}
        >
            {initials}
        </span>
    );
}
