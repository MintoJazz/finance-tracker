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

export interface WalletHashColors {
    hue: number;
    cardBg: string;
    cardGradient: string;
    quickActionBg: string;
    quickActionBorder: string;
    quickActionHoverBg: string;
    accentColor: string;
}

export function getWalletHashColors(name: string): WalletHashColors {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = Math.trunc((name.codePointAt(i) ?? 0) + ((hash << 5) - hash));
    }

    const hue = Math.abs(hash) % 360;

    return {
        hue,
        cardBg: `oklch(0.64 0.22 ${hue})`,
        cardGradient: `linear-gradient(135deg, oklch(0.66 0.24 ${hue}) 0%, oklch(0.56 0.20 ${hue}) 100%)`,
        quickActionBg: `oklch(0.65 0.18 ${hue} / 0.08)`,
        quickActionBorder: `oklch(0.65 0.18 ${hue} / 0.18)`,
        quickActionHoverBg: `oklch(0.65 0.18 ${hue} / 0.15)`,
        accentColor: `oklch(0.60 0.20 ${hue})`,
    };
}
