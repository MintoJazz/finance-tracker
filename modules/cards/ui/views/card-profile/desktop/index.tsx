"use client";

import { useState } from "react";
import { CreditCard, Eye, EyeOff, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
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
import { CardCycleNavigator } from "@/modules/cards/ui/components/card-profile/card-cycle-navigator";
import { CardLimitProgress } from "@/modules/cards/ui/components/card-profile/card-limit-progress";
import { CardQuickActions } from "@/modules/cards/ui/components/card-profile/card-quick-actions";
import { CycleNavigatorSkeleton } from "@/modules/cards/ui/components/card-profile/skeletons/cycle-navigator-skeleton";
import { CardProfileSkeleton } from "@/modules/cards/ui/components/card-profile/skeletons/profile-skeleton";
import { ArchiveCardModalViewDesktop } from "../../archive-card-modal";
import { RestoreCardModalViewDesktop } from "../../restore-card-modal";
import { MovementFilter } from "@/modules/movements/ui/components/movement-filter";
import { WalletMovementSearch } from "@/modules/movements/ui/components/wallet-movement-search";
import { CreditMovementTable } from "@/modules/movements/ui/components/credit-movement-table";
import { CardProfileDesktopProps } from "../types";

export default function CardProfileViewDesktop({
    profile,
    isLoadingProfile,
    profileError,
    cardActionsContext,
    archiveContext,
    restoreContext,
    cycleNavigation,
    movementsData,
    isLoadingMovements,
    movementsError,
    movementActionContext,
    filters,
    activeFilterCount,
    applyFilters,
    clearFilters,
    paginationContext,
}: CardProfileDesktopProps) {
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
        <div className="w-full max-w-5xl lg:max-w-6xl mx-auto flex flex-col gap-5 p-4 md:p-6 lg:p-8 lg:py-2 min-w-0">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_290px] xl:grid-cols-[minmax(0,1fr)_310px] items-start gap-6 w-full min-w-0">
                {/* Coluna Esquerda: Navegador de Faturas + Extrato da Fatura */}
                <main className="min-w-0 w-full flex flex-col gap-3.5">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <h2 className="text-base font-semibold tracking-tight text-foreground">
                                Extrato da Fatura
                            </h2>
                            <Badge variant="outline" className="tabular-nums text-xs">
                                {movementsData?.total ?? 0}
                            </Badge>
                        </div>
                        {activeFilterCount > 0 && (
                            <span className="text-xs text-muted-foreground">
                                {activeFilterCount}{" "}
                                {activeFilterCount === 1 ? "filtro ativo" : "filtros ativos"}
                            </span>
                        )}
                    </div>

                    {/* Seletor Horizontal de Fatura / Ciclo */}
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

                    {/* Busca + Toggle de Estornadas */}
                    <div className="flex items-center gap-2.5 w-full mb-1">
                        <WalletMovementSearch
                            value={filters.q}
                            onChange={(q: string | undefined) => applyFilters({ q })}
                            className="flex-1"
                        />
                        <Toggle
                            size="sm"
                            variant="outline"
                            pressed={Boolean(filters.includeReversed)}
                            onPressedChange={(pressed) =>
                                applyFilters({ includeReversed: pressed })
                            }
                            className="text-xs gap-1.5 shrink-0"
                            aria-label="Incluir movimentações estornadas"
                        >
                            {filters.includeReversed ? (
                                <Eye className="size-3.5" />
                            ) : (
                                <EyeOff className="size-3.5 text-muted-foreground" />
                            )}
                            Incluir estornadas
                        </Toggle>
                    </div>

                    {movementsError ? (
                        <ErrorView
                            title="Erro ao carregar lançamentos da fatura"
                            error={movementsError}
                        />
                    ) : (
                        <CreditMovementTable
                            data={movementsData}
                            isLoading={isLoadingProfile || isLoadingMovements}
                            hasFilters={activeFilterCount > 0}
                            onClearFilters={clearFilters}
                            setPage={paginationContext.setPage}
                            setPageSize={paginationContext.setPageSize}
                            actionContext={movementActionContext}
                        />
                    )}
                </main>

                {/* Coluna Direita: Sticky Sidebar com Perfil do Cartão + Filtros */}
                <aside className="w-full flex flex-col gap-5 lg:sticky lg:top-6 min-w-0">
                    {isLoadingProfile || !profile ? (
                        <CardProfileSkeleton />
                    ) : (
                        <ProfileCard isArchived={profile.isArchived}>
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
                                {/* Nome do Cartão e Regra de Fechamento/Vencimento */}
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

                                {/* Seção de Limite Disponível + Barra de Uso */}
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

                                {/* Botões de Ação Rápida do Cartão */}
                                <CardQuickActions
                                    card={profile}
                                    cardActionsContext={cardActionsContext}
                                />
                            </ProfileCardContent>

                            <div className="border-t border-border/40 mx-4 sm:mx-4.5" />

                            {/* Filtros da Fatura (Sem DateRangePicker pois o ciclo controla from/to) */}
                            <div className="px-4 sm:px-4.5 pb-4 pt-3 flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Filtros da fatura
                                    </span>
                                    {activeFilterCount > 0 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearFilters}
                                            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground gap-1 -mr-1"
                                        >
                                            <X className="size-3" />
                                            Limpar filtros
                                        </Button>
                                    )}
                                </div>
                                <MovementFilter
                                    values={filters}
                                    onChange={applyFilters}
                                    onReset={clearFilters}
                                >
                                    <MovementFilter.Direction />
                                    <MovementFilter.Types />
                                </MovementFilter>
                            </div>
                        </ProfileCard>
                    )}
                </aside>
            </div>

            <ArchiveCardModalViewDesktop {...archiveContext} />
            <RestoreCardModalViewDesktop {...restoreContext} />
        </div>
    );
}