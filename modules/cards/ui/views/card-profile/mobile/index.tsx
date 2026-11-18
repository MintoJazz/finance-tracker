"use client";

import { useState } from "react";
import { CreditCard, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ErrorView } from "@/components/error-view";
import {
    ProfileCard,
    ProfileCardAvatar,
    ProfileCardBanner,
    ProfileCardContent,
} from "@/components/profile-card";
import { getHashColorStyle } from "@/lib/avatar-utils";
import { formatMoney } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { CardLimitProgress } from "@/modules/cards/ui/components/card-profile/card-limit-progress";
import { useCardProfileGlobalActions } from "../hooks/use-card-profile-global-actions";
import { CardProfileSkeleton } from "@/modules/cards/ui/components/card-profile/skeletons/profile-skeleton";
import { ArchiveCardModalViewMobile } from "../../archive-card-modal";
import { RestoreCardModalViewMobile } from "../../restore-card-modal";
import { MovementFilter } from "@/modules/movements/ui/components/movement-filter";
import { MovementFilterDrawer } from "@/modules/movements/ui/components/movement-filter/drawer";
import { CycleStatementMobileView } from "@/modules/cycles/ui/views/cycle-statement/mobile";
import { CardProfileMobileProps } from "../types";

export default function CardProfileViewMobile({
    profile,
    isLoadingProfile,
    profileError,
    cardActionsContext,
    archiveContext,
    restoreContext,
    statementProps,
    isFilterDrawerOpen,
    setIsFilterDrawerOpen,
    filters,
    applyFilters,
    clearFilters,
}: CardProfileMobileProps) {
    const [isVisible, setIsVisible] = useState(true);
    useCardProfileGlobalActions(profile, cardActionsContext);

    if (profileError) {
        return (
            <ErrorView
                title="Erro ao carregar cartão"
                error={profileError}
            />
        );
    }

    const hashStyle = profile
        ? getHashColorStyle(profile.name || "C")
        : { backgroundColor: "", color: "" };

    return (
        <div className="flex w-full flex-col pb-12">
            {/* 1. Card do Perfil no Topo */}
            <div className="w-full">
                {isLoadingProfile || !profile ? (
                    <div className="px-4 pt-4">
                        <CardProfileSkeleton />
                    </div>
                ) : (
                    <ProfileCard
                        isArchived={profile.isArchived}
                        className="rounded-t-none border-0 shadow-none pb-2"
                    >
                        <ProfileCardBanner
                            style={{ backgroundColor: hashStyle.backgroundColor }}
                        >
                            <ProfileCardAvatar
                                style={{ borderColor: hashStyle.color }}
                                isArchived={profile.isArchived}
                            >
                                <CreditCard
                                    className="size-6 text-muted-foreground stroke-[1.75]"
                                    color={hashStyle.color}
                                />
                            </ProfileCardAvatar>
                        </ProfileCardBanner>
                        <ProfileCardContent>
                            <div className="flex flex-col items-center justify-center text-center gap-0.5">
                                <div className="flex items-center justify-center gap-1.5 max-w-full">
                                    <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground truncate">
                                        {profile.name}
                                    </h2>
                                    {profile.isArchived && (
                                        <Badge
                                            variant="outline"
                                            className="text-[10px] py-0 px-1 text-amber-700 dark:text-amber-400 border-amber-500/30 shrink-0"
                                        >
                                            Arquivado
                                        </Badge>
                                    )}
                                </div>
                                <span className="text-[11px] sm:text-xs text-muted-foreground">
                                    Fecha dia {profile.closingDay} • Vence dia{" "}
                                    {profile.dueDay}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                                        Limite disponível
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setIsVisible((v) => !v)}
                                        className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded-full transition-colors"
                                        aria-label={
                                            isVisible
                                                ? "Ocultar limites"
                                                : "Mostrar limites"
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
                                        profile.isArchived && "opacity-75"
                                    )}
                                >
                                    {isVisible
                                        ? formatMoney(profile.availableLimit)
                                        : "R$ ••••••"}
                                </div>
                                <CardLimitProgress
                                    limit={profile.limit}
                                    usedLimit={profile.usedLimit}
                                    isVisible={isVisible}
                                />
                            </div>
                        </ProfileCardContent>
                    </ProfileCard>
                )}
            </div>

            {/* 2. Extrato Genérico da Fatura */}
            <div className="w-full">
                <CycleStatementMobileView
                    {...statementProps}
                    onOpenFilters={() => setIsFilterDrawerOpen(true)}
                />
            </div>

            {/* Drawer de Filtros Mobile */}
            <MovementFilterDrawer
                open={isFilterDrawerOpen}
                onOpenChange={setIsFilterDrawerOpen}
                filters={filters}
                onApply={applyFilters}
                onClear={clearFilters}
                scope="CARD"
                title="Filtros da Fatura"
                description="Filtre os lançamentos por tipo e direção."
            >
                <MovementFilter.Direction />
                <MovementFilter.Types />
            </MovementFilterDrawer>

            <ArchiveCardModalViewMobile {...archiveContext} />
            <RestoreCardModalViewMobile {...restoreContext} />
        </div>
    );
}
