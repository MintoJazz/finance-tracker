"use client";

import { useState } from "react";
import { CreditCard, Eye, EyeOff, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import { ErrorView } from "@/components/error-view";
import { InputGroupButton } from "@/components/ui/input-group";
import {
    ProfileCard,
    ProfileCardAvatar,
    ProfileCardBanner,
    ProfileCardContent,
} from "@/components/profile-card";
import { getHashColorStyle } from "@/lib/avatar-utils";
import { formatMoney } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { CardCycleNavigator } from "@/modules/cards/ui/components/card-profile/card-cycle-navigator";
import { CardLimitProgress } from "@/modules/cards/ui/components/card-profile/card-limit-progress";
import { CardQuickActions } from "@/modules/cards/ui/components/card-profile/card-quick-actions";
import { CycleNavigatorSkeleton } from "@/modules/cards/ui/components/card-profile/skeletons/cycle-navigator-skeleton";
import { CardProfileSkeleton } from "@/modules/cards/ui/components/card-profile/skeletons/profile-skeleton";
import { ArchiveCardModalViewMobile } from "../../archive-card-modal";
import { RestoreCardModalViewMobile } from "../../restore-card-modal";
import { MovementFilter } from "@/modules/movements/ui/components/movement-filter";
import { MovementFilterDrawer } from "@/modules/movements/ui/components/movement-filter/drawer";
import { CreditMovementList } from "@/modules/movements/ui/components/credit-movement-list";
import { WalletMovementSearch } from "@/modules/movements/ui/components/wallet-movement-search";
import { CardProfileMobileProps } from "../types";

export default function CardProfileViewMobile({
    profile,
    isLoadingProfile,
    profileError,
    cardActionsContext,
    archiveContext,
    restoreContext,
    cycleNavigation,
    items,
    total,
    hasMore,
    isLoadingMovements,
    isLoadingMore,
    movementsError,
    sentinelRef,
    movementActionContext,
    filters,
    activeFilterCount,
    applyFilters,
    clearFilters,
    isFilterDrawerOpen,
    setIsFilterDrawerOpen,
}: CardProfileMobileProps) {
    const [isVisible, setIsVisible] = useState(true);

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

    const { activeCycle, hasPrevCycle, hasNextCycle, onPrevCycle, onNextCycle } =
        cycleNavigation;

    return (
        <div className="flex w-full flex-col gap-4 pb-12">
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

                            <CardQuickActions
                                card={profile}
                                cardActionsContext={cardActionsContext}
                            />
                        </ProfileCardContent>
                    </ProfileCard>
                )}
            </div>

            {/* 2. Seção Extrato da Fatura */}
            <div className="flex flex-col gap-2.5 pt-1">
                <div className="flex items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <h2 className="text-base font-semibold tracking-tight text-foreground">
                            Fatura
                        </h2>
                        <Badge variant="outline" className="tabular-nums text-xs">
                            {total}
                        </Badge>
                    </div>
                    <Toggle
                        size="sm"
                        variant="outline"
                        pressed={Boolean(filters.includeReversed)}
                        onPressedChange={(pressed) =>
                            applyFilters({ includeReversed: pressed })
                        }
                        className="text-xs h-8 px-2.5 gap-1.5 border-border/80"
                        aria-label="Incluir movimentações estornadas"
                    >
                        {filters.includeReversed ? (
                            <Eye className="size-3.5" />
                        ) : (
                            <EyeOff className="size-3.5 text-muted-foreground" />
                        )}
                        <span>Estornadas</span>
                    </Toggle>
                </div>

                {/* Navegador de Faturas / Ciclos */}
                <div className="px-4">
                    {isLoadingProfile || !activeCycle ? (
                        <CycleNavigatorSkeleton />
                    ) : (
                        <CardCycleNavigator
                            activeCycle={activeCycle}
                            hasPrev={hasPrevCycle}
                            hasNext={hasNextCycle}
                            onPrev={onPrevCycle}
                            onNext={onNextCycle}
                        />
                    )}
                </div>

                {/* Barra de Busca + Botão de Filtros */}
                <div className="px-4 w-full mb-1">
                    <WalletMovementSearch
                        value={filters.q}
                        onChange={(q: string | undefined) => applyFilters({ q })}
                    >
                        <div className="h-3.5 w-px bg-border/70" />
                        <InputGroupButton
                            type="button"
                            variant="ghost"
                            size="xs"
                            onClick={() => setIsFilterDrawerOpen(true)}
                            className="h-6 gap-1 px-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/60"
                            aria-label="Filtrar fatura"
                        >
                            <SlidersHorizontal className="size-3.5 text-muted-foreground" />
                            <span>Filtros</span>
                            {activeFilterCount > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="h-4 min-w-4 px-1 text-[10px] font-bold"
                                >
                                    {activeFilterCount}
                                </Badge>
                            )}
                        </InputGroupButton>
                    </WalletMovementSearch>
                </div>

                {movementsError ? (
                    <div className="px-4">
                        <ErrorView
                            title="Erro ao carregar lançamentos da fatura"
                            error={movementsError}
                        />
                    </div>
                ) : (
                    <CreditMovementList
                        items={items}
                        isLoading={isLoadingProfile || isLoadingMovements}
                        isLoadingMore={isLoadingMore}
                        hasMore={hasMore}
                        sentinelRef={sentinelRef}
                        hasFilters={activeFilterCount > 0}
                        onClearFilters={clearFilters}
                        actionContext={movementActionContext}
                    />
                )}
            </div>

            {/* Drawer de Filtros Mobile (Sem DateRangePicker pois o ciclo controla from/to) */}
            <MovementFilterDrawer
                open={isFilterDrawerOpen}
                onOpenChange={setIsFilterDrawerOpen}
                filters={filters}
                onApply={applyFilters}
                onClear={clearFilters}
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