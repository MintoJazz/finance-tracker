"use client";

import { Eye, EyeOff, X, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { ErrorView } from "@/components/error-view";
import { ProfileCard, ProfileCardBanner, ProfileCardAvatar, ProfileCardContent } from "@/components/profile-card";
import { getHashColorStyle } from "@/lib/avatar-utils";
import { formatDate, formatMoney } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { WalletQuickActions } from "@/modules/account/ui/components/wallet-profile/wallet-quick-actions";
import { ProfileSkeleton } from "@/modules/account/ui/components/wallet-profile/skeletons/profile-skeleton";
import { ArchiveWalletModalViewDesktop } from "../../archive-wallet-modal";
import { RestoreWalletModalViewDesktop } from "../../restore-wallet-modal";
import { WalletMovementTable } from "@/modules/ledger/ui/components/wallet-movement-table";
import { WalletMovementFilterForm } from "@/modules/ledger/ui/components/wallet-movement-filter-form";
import { WalletMovementSearch } from "@/modules/ledger/ui/components/wallet-movement-search";
import { WalletProfileDesktopProps } from "../types";
import { useState } from "react";

export default function WalletProfileViewDesktop({
    profile,
    isLoadingProfile,
    profileError,
    walletActionsContext,
    archiveContext,
    restoreContext,
    movementsData,
    isLoadingMovements,
    movementsError,
    movementActionContext,
    filters,
    activeFilterCount,
    applyFilters,
    clearFilters,
    paginationContext,
}: WalletProfileDesktopProps) {
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
        <div className="w-full max-w-5xl lg:max-w-6xl mx-auto flex flex-col gap-5 p-4 md:p-6 lg:p-8 lg:py-2 min-w-0">
            {/* Layout de duas seções lado a lado: Extrato + Sticky Sidebar compacta */}
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_290px] xl:grid-cols-[minmax(0,1fr)_310px] items-start gap-6 w-full min-w-0">
                {/* Coluna Esquerda: Extrato de Movimentações */}
                <main className="min-w-0 w-full flex flex-col gap-3.5">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <h2 className="text-base font-semibold tracking-tight text-foreground">
                                Extrato de Movimentações
                            </h2>
                            <Badge variant="outline" className="tabular-nums text-xs">
                                {movementsData?.total ?? 0}
                            </Badge>
                        </div>
                        {activeFilterCount > 0 && (
                            <span className="text-xs text-muted-foreground">
                                {activeFilterCount} {activeFilterCount === 1 ? "filtro ativo" : "filtros ativos"}
                            </span>
                        )}
                    </div>
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
                            onPressedChange={(pressed) => applyFilters({ includeReversed: pressed })}
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
                            title="Erro ao carregar movimentações"
                            error={movementsError}
                        />
                    ) : (
                        <WalletMovementTable
                            data={movementsData}
                            isLoading={isLoadingMovements}
                            hasFilters={activeFilterCount > 0}
                            onClearFilters={clearFilters}
                            setPage={paginationContext.setPage}
                            setPageSize={paginationContext.setPageSize}
                            actionContext={movementActionContext}
                        />
                    )}
                </main>

                {/* Coluna Direita: Sticky Sidebar */}
                <aside className="w-full flex flex-col gap-5 lg:sticky lg:top-6 min-w-0">
                    {/* Card Unificado: Perfil + Filtros */}
                    {isLoadingProfile || !profile ? (
                        <ProfileSkeleton />
                    ) : (
                        <ProfileCard isArchived={profile.isArchived}>
                            <ProfileCardBanner style={{ backgroundColor: hashStyle.backgroundColor }}>
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

                            <div className="border-t border-border/40 mx-4 sm:mx-4.5" />

                            <div className="px-4 sm:px-4.5 pb-4 pt-3 flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Filtros
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
                                <WalletMovementFilterForm
                                    values={filters}
                                    onChange={applyFilters}
                                    onReset={clearFilters}
                                    hideResetButton={true}
                                />
                            </div>
                        </ProfileCard>
                    )}
                </aside>
            </div>

            <ArchiveWalletModalViewDesktop {...archiveContext} />
            <RestoreWalletModalViewDesktop {...restoreContext} />
        </div>
    );
}