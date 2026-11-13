import React from "react";
import { ArrowRightLeft, CheckCircle2, FileText, RotateCcw, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    MovementEntry,
    MovementEntryScope,
} from "@/modules/movements/models/movement-entry.schema";
import { COUNTERPART_KIND_THEMES } from "../../themes/counterpart-kind";
import {
    getCategoryTheme,
} from "../category-badge";
import { CategoryIcon } from "../category-badge/category-icon";

interface MovementEntryAvatarProps {
    entry: MovementEntry;
    scope?: MovementEntryScope;
    size?: "sm" | "md" | "lg";
    className?: string;
}

export function MovementEntryAvatar({
    entry,
    scope = "WALLET",
    size = "md",
    className,
}: MovementEntryAvatarProps) {
    const { counterpart, type } = entry;
    const { appearance, kind } = counterpart;

    const sizeClasses = {
        sm: "size-7 min-w-7 text-xs rounded-lg",
        md: "size-9 min-w-9 text-sm rounded-xl",
        lg: "size-11 min-w-11 text-base rounded-xl",
    }[size];

    const iconSizes = {
        sm: 14,
        md: 18,
        lg: 22,
    }[size];

    // Regra 1: Transferências (entre contas de custódia OU cessão de dívida entre contratos)
    // Exibe sempre o ícone semântico de transferência (ArrowRightLeft), nunca folha de papel!
    if (type === "TRANSFER") {
        return (
            <div
                className={cn(
                    "flex items-center justify-center shrink-0 bg-blue-500/10 text-blue-600 dark:text-blue-400",
                    sizeClasses,
                    className
                )}
                title="Transferência / Cessão"
            >
                <ArrowRightLeft size={iconSizes} />
            </div>
        );
    }

    // Regra 2: Quitação recebida em Cartão ou Ciclo de Contrato
    if (type === "SETTLEMENT" && scope !== "WALLET") {
        return (
            <div
                className={cn(
                    "flex items-center justify-center shrink-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                    sizeClasses,
                    className
                )}
                title="Quitação"
            >
                <CheckCircle2 size={iconSizes} />
            </div>
        );
    }

    // Regra 3: A contraparte possui aparência customizada (BalanceAppearance do banco: ícone/cor de categoria ou conta)
    if (appearance && (appearance.icon || appearance.color)) {
        const { palette, style: colorStyle } = getCategoryTheme(appearance.color);

        return (
            <div
                style={colorStyle}
                className={cn(
                    "flex items-center justify-center shrink-0 transition-colors",
                    palette
                        ? cn(palette.bg, palette.text)
                        : !colorStyle && "bg-muted/70 text-foreground",
                    sizeClasses,
                    className
                )}
            >
                <CategoryIcon name={appearance.icon} size={iconSizes} />
            </div>
        );
    }

    // Regra 4: Sem contraparte (NONE) - usa ícone semântico do tipo de movimento
    if (kind === "NONE") {
        if (type === "ADJUSTMENT") {
            return (
                <div
                    className={cn(
                        "flex items-center justify-center shrink-0 bg-amber-500/10 text-amber-600 dark:text-amber-400",
                        sizeClasses,
                        className
                    )}
                    title="Ajuste"
                >
                    <SlidersHorizontal size={iconSizes} />
                </div>
            );
        }

        if (type === "REVERSAL") {
            return (
                <div
                    className={cn(
                        "flex items-center justify-center shrink-0 bg-rose-500/10 text-rose-600 dark:text-rose-400",
                        sizeClasses,
                        className
                    )}
                    title="Estorno"
                >
                    <RotateCcw size={iconSizes} />
                </div>
            );
        }

        if (type === "PROVISION") {
            return (
                <div
                    className={cn(
                        "flex items-center justify-center shrink-0 bg-sky-500/10 text-sky-600 dark:text-sky-400",
                        sizeClasses,
                        className
                    )}
                    title="Provisão"
                >
                    <FileText size={iconSizes} />
                </div>
            );
        }
    }

    // Regra 5: Fallback para o ícone padrão do kind no Theming Registry
    const counterpartTheme = COUNTERPART_KIND_THEMES[kind];
    const FallbackIcon = counterpartTheme?.icon;

    if (FallbackIcon) {
        return (
            <div
                className={cn(
                    "flex items-center justify-center shrink-0",
                    counterpartTheme.avatarClassName,
                    sizeClasses,
                    className
                )}
            >
                <FallbackIcon size={iconSizes} />
            </div>
        );
    }

    return (
        <div
            className={cn(
                "flex items-center justify-center shrink-0 bg-muted/70 text-muted-foreground",
                sizeClasses,
                className
            )}
        >
            <FileText size={iconSizes} />
        </div>
    );
}
