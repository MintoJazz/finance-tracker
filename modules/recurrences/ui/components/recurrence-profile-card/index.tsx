"use client";

import React from "react";
import { Edit3, Eye, EyeOff, MoreHorizontal, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    ProfileCard,
    ProfileCardAvatar,
    ProfileCardBanner,
    ProfileCardContent,
} from "@/components/profile-card";
import { getHashColorStyle } from "@/lib/avatar-utils";
import { formatMoney } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { getCategoryTheme } from "@/modules/movements/ui/components/category-badge";
import { CategoryIcon } from "@/modules/movements/ui/components/category-badge/category-icon";
import { RecurrenceStatusBadge } from "../recurrence-status-badge";
import {
    formatRecurrenceDue,
    RECURRENCE_FREQUENCY_LABELS,
} from "@/modules/recurrences/ui/themes/recurrence.themes";
import type { RecurrenceFrequency } from "@/modules/recurrences/models/schemas/recurrence-item.schema";
import type { RecurrenceProfile } from "@/modules/recurrences/models/schemas/recurrence-profile.schema";

export interface RecurrenceProfileCardProps {
    recurrence: RecurrenceProfile;
    isVisible: boolean;
    onToggleVisibility: () => void;
    onEdit?: () => void;
    onToggleActive?: () => void;
    onOpenActions?: () => void;
    className?: string;
}

export function RecurrenceProfileCard({
    recurrence,
    isVisible,
    onToggleVisibility,
    onEdit,
    onToggleActive,
    onOpenActions,
    className,
}: RecurrenceProfileCardProps) {
    const {
        name,
        isActive,
        category,
        frequency,
        currentAmount,
        direction,
    } = recurrence;

    const color = recurrence.color ?? category?.color;
    const { palette, style: colorStyle } = getCategoryTheme(color);
    const hasCategoryTheme = Boolean(palette || colorStyle);
    const hashStyle = hasCategoryTheme ? null : getHashColorStyle(name);

    const bannerBackground =
        colorStyle?.backgroundColor ?? hashStyle?.backgroundColor;
    const avatarBorderColor =
        colorStyle?.borderColor || colorStyle?.color || hashStyle?.color;

    const frequencyLabel =
        RECURRENCE_FREQUENCY_LABELS[frequency as RecurrenceFrequency] ?? frequency;

    return (
        <ProfileCard isArchived={!isActive} className={className}>
            <ProfileCardBanner
                className={cn(palette?.bg)}
                style={bannerBackground ? { backgroundColor: bannerBackground } : undefined}
            >
                <ProfileCardAvatar
                    className={cn(palette?.border)}
                    style={avatarBorderColor ? { borderColor: avatarBorderColor } : undefined}
                    isArchived={!isActive}
                >
                    <div
                        style={colorStyle ?? (hashStyle ? { color: hashStyle.color } : undefined)}
                        className={cn(
                            "flex size-full items-center justify-center rounded-2xl",
                            palette
                                ? cn(palette.bg, palette.text)
                                : !colorStyle && !hashStyle && "text-muted-foreground",
                            !isActive && "opacity-75"
                        )}
                    >
                        <CategoryIcon name={recurrence.icon} size={24} />
                    </div>
                </ProfileCardAvatar>
            </ProfileCardBanner>

            <ProfileCardContent>
                {/* Nome, Status e Detalhes da Regra */}
                <div className="flex flex-col items-center justify-center text-center gap-1">
                    <div className="flex items-center justify-center gap-1.5 max-w-full">
                        <h2
                            className="text-base sm:text-lg font-semibold tracking-tight text-foreground truncate"
                            title={name}
                        >
                            {name}
                        </h2>
                        <RecurrenceStatusBadge item={recurrence} className="shrink-0" />
                    </div>

                    <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                        <span>{frequencyLabel}</span>
                        <span>•</span>
                        <span>{formatRecurrenceDue(recurrence, { withPrefix: true })}</span>
                    </div>

                    {category?.name && (
                        <span className="text-[11px] text-muted-foreground/80 truncate">
                            {category.name}
                        </span>
                    )}
                </div>

                {/* Seção de Valor Previsto */}
                <div className="flex flex-col gap-1 mt-1">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                            {direction === "CREDIT"
                                ? "Recebimento recorrente"
                                : "Cobrança recorrente"}
                        </span>
                        <button
                            type="button"
                            onClick={onToggleVisibility}
                            className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded-full transition-colors"
                            aria-label={
                                isVisible ? "Ocultar valor" : "Mostrar valor"
                            }
                        >
                            {isVisible ? (
                                <Eye className="size-3.5 sm:size-4" />
                            ) : (
                                <EyeOff className="size-3.5 sm:size-4" />
                            )}
                        </button>
                    </div>

                    <div
                        className={cn(
                            "text-2xl sm:text-[26px] font-bold tracking-tight tabular-nums transition-colors text-foreground",
                            !isActive && "opacity-75"
                        )}
                    >
                        {isVisible ? formatMoney(currentAmount) : "R$ ••••••"}
                    </div>
                </div>

                {/* Ações Rápidas */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onEdit}
                        className="flex flex-col items-center justify-center h-auto py-2 px-1 text-xs gap-1 border-border/80 hover:bg-accent/60 cursor-pointer"
                    >
                        <Edit3 className="size-4 text-muted-foreground" />
                        <span>Editar</span>
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onToggleActive}
                        className="flex flex-col items-center justify-center h-auto py-2 px-1 text-xs gap-1 border-border/80 hover:bg-accent/60 cursor-pointer"
                    >
                        <Power className="size-4 text-muted-foreground" />
                        <span>{isActive ? "Pausar" : "Ativar"}</span>
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onOpenActions}
                        className="flex flex-col items-center justify-center h-auto py-2 px-1 text-xs gap-1 border-border/80 hover:bg-accent/60 cursor-pointer"
                    >
                        <MoreHorizontal className="size-4 text-muted-foreground" />
                        <span>Opções</span>
                    </Button>
                </div>
            </ProfileCardContent>
        </ProfileCard>
    );
}
