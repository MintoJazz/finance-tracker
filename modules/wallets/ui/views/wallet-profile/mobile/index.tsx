"use client";

import { Eye, EyeOff, SlidersHorizontal, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import { ErrorView } from "@/components/error-view";
import { InputGroupButton } from "@/components/ui/input-group";
import { ProfileCard, ProfileCardBanner, ProfileCardAvatar, ProfileCardContent } from "@/components/profile-card";
import { getHashColorStyle } from "@/lib/avatar-utils";
import { formatDate, formatMoney } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { WalletQuickActions } from "@/modules/wallets/ui/components/wallet-profile/wallet-quick-actions";
import { ProfileSkeleton } from "@/modules/wallets/ui/components/wallet-profile/skeletons/profile-skeleton";
import { ArchiveWalletModalViewMobile } from "../../archive-wallet-modal";
import { RestoreWalletModalViewMobile } from "../../restore-wallet-modal";
import { WalletMovementList } from "@/modules/movements/ui/components/wallet-movement-list";
import { MovementFilter } from "@/modules/movements/ui/components/movement-filter";
import { MovementFilterDrawer } from "@/modules/movements/ui/components/movement-filter/drawer";
import { WalletMovementSearch } from "@/modules/movements/ui/components/wallet-movement-search";
import { WalletProfileMobileProps } from "../types";
import { useState } from "react";

export default function WalletProfileViewMobile({
    profile,
    isLoadingProfile,
    profileError,
    walletActionsContext,
    archiveContext,
    restoreContext,
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
}: WalletProfileMobileProps) {
    const [isVisible, setIsVisible] = useState(true);

    if (profileError) {
        return (
            <ErrorView
                title="Erro ao carregar carteira"
                error={profileError}
            />
        );
    }

    const hashStyle = profile ? getHashColorStyle(profile.name || "C") : { backgroundColor: "", color: "" };
    const isNegative = profile ? profile.currentBalance < 0 : false;

    return (
        <div className="flex w-full flex-col gap-4 pb-12">
            {/* 2. Card Unificado do Perfil: com padding lateral próprio */}
            <div className="w-full">
                {isLoadingProfile || !profile ? (
                    <div className="px-4 pt-4">
                        <ProfileSkeleton />
                    </div>
                ) : (
                    <ProfileCard
                        isArchived={profile.isArchived}
                        className="rounded-t-none border-0 shadow-none pb-2"
                    >
                        <ProfileCardBanner style={{ backgroundColor: hashStyle.backgroundColor }} >
                            <ProfileCardAvatar style={{ borderColor: hashStyle.color }} isArchived={profile.isArchived}>
                                <Wallet className="size-6 text-muted-foreground stroke-[1.75]" color={hashStyle.color} />
                            </ProfileCardAvatar>
                        </ProfileCardBanner>
                        <ProfileCardContent>
                            {/* Nome da Carteira e Subtítulo */}
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
                                            Arquivada
                                        </Badge>
                                    )}
                                </div>
                                <span className="text-[11px] sm:text-xs text-muted-foreground">
                                    {profile.isArchived
                                        ? "Carteira arquivada"
                                        : `Criada em ${formatDate(profile.createdAt)}`}
                                </span>
                            </div>

                            {/* Seção de Saldo: MEUS SALDOS + Olho + R$ ... */}
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                                        Meus saldos
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setIsVisible((v) => !v)}
                                        className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded-full transition-colors"
                                        aria-label={isVisible ? "Ocultar saldo" : "Mostrar saldo"}
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
                                        "text-2xl sm:text-[26px] font-bold tracking-tight tabular-nums transition-colors",
                                        isNegative ? "text-rose-600 dark:text-rose-400" : "text-foreground",
                                        profile.isArchived && "opacity-75"
                                    )}
                                >
                                    {isVisible ? formatMoney(profile.currentBalance) : "R$ ••••••"}
                                </div>
                            </div>

                            {/* Botões de Ação Rápida */}
                            <WalletQuickActions
                                wallet={profile}
                                walletActionsContext={walletActionsContext}
                            />
                        </ProfileCardContent>
                    </ProfileCard>
                )}
            </div>

            {/* 3. Seção Extrato de Movimentações: Título com padding e lista full-bleed */}
            <div className="flex flex-col gap-2.5 pt-1">
                <div className="flex items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <h2 className="text-base font-semibold tracking-tight text-foreground">
                            Movimentações
                        </h2>
                        <Badge variant="outline" className="tabular-nums text-xs">
                            {total}
                        </Badge>
                    </div>
                    <Toggle
                        size="sm"
                        variant="outline"
                        pressed={Boolean(filters.includeReversed)}
                        onPressedChange={(pressed) => applyFilters({ includeReversed: pressed })}
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
                            aria-label="Filtrar movimentações"
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

                {/* Exibição condicional de erro ou lista full-bleed */}
                {movementsError ? (
                    <div className="px-4">
                        <ErrorView
                            title="Erro ao carregar movimentações"
                            error={movementsError}
                        />
                    </div>
                ) : (
                    <WalletMovementList
                        items={items}
                        isLoading={isLoadingMovements}
                        isLoadingMore={isLoadingMore}
                        hasMore={hasMore}
                        sentinelRef={sentinelRef}
                        hasFilters={activeFilterCount > 0}
                        onClearFilters={clearFilters}
                        actionContext={movementActionContext}
                    />
                )}
            </div>

            {/* Drawer de Filtros Mobile */}
            <MovementFilterDrawer
                open={isFilterDrawerOpen}
                onOpenChange={setIsFilterDrawerOpen}
                filters={filters}
                onApply={applyFilters}
                onClear={clearFilters}
                title="Filtros do Extrato"
                description="Filtre as movimentações por período, tipo e direção."
            >
                <MovementFilter.Direction />
                <MovementFilter.DateRange />
                <MovementFilter.Types />
            </MovementFilterDrawer>

            <ArchiveWalletModalViewMobile {...archiveContext} />
            <RestoreWalletModalViewMobile {...restoreContext} />
        </div>
    );
}