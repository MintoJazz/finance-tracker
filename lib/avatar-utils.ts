import { CSSProperties } from "react";

export function getHashColorStyle(name: string): CSSProperties {
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

export function getInitials(name: string): string {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
        return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return name.trim().slice(0, 2).toUpperCase();
}

export const getBalanceColorStyle = getHashColorStyle;
