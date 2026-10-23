"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ErrorView } from "@/components/error-view";
import { SlidersHorizontal } from "lucide-react";
import { ContractProfileMobileProps } from "../types";
import { ArchiveContractModalViewMobile } from "../../archive-contract-modal";
import { RestoreContractModalViewMobile } from "../../restore-contract-modal";
import ContractCycleFilterDrawer from "../../../components/contract-profile/contract-cycle-filter-drawer";
import ContractCycleList from "../../../components/contract-profile/contract-cycle-list";
import ContractProfileCard from "../../../components/contract-profile/contract-profile-card";
import ContractProfileSkeleton from "../../../components/contract-profile/skeletons/contract-profile-skeleton";

export default function ContractProfileViewMobile({
    profile,
    isLoadingProfile,
    profileError,
    contractActionsContext,
    archiveContext,
    restoreContext,
    items,
    total,
    hasMore,
    isLoadingCycles,
    isLoadingMore,
    cyclesError,
    sentinelRef,
    filters,
    activeFilterCount,
    applyFilters,
    clearFilters,
    isFilterDrawerOpen,
    setIsFilterDrawerOpen,
    cycleActionContext,
}: ContractProfileMobileProps) {
    if (profileError) {
        return (
            <ErrorView
                title="Erro ao carregar contrato"
                error={profileError}
            />
        );
    }

    const isPayable = profile?.type === "PAYABLE";

    return (
        <div className="flex w-full flex-col gap-4 pb-12">
            {/* 1. Card do Perfil do Contrato no Topo */}
            <div className="w-full">
                {isLoadingProfile || !profile ? (
                    <div className="px-4 pt-4">
                        <ContractProfileSkeleton />
                    </div>
                ) : (
                    <ContractProfileCard
                        contract={profile}
                        contractActionsContext={contractActionsContext}
                        className="rounded-t-none border-0 shadow-none pb-2"
                    />
                )}
            </div>

            {/* 2. Seção de Ciclos */}
            <div className="flex flex-col gap-2.5 pt-1">
                <div className="flex items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <h2 className="text-base font-semibold tracking-tight text-foreground">
                            Ciclos
                        </h2>
                        <Badge variant="outline" className="tabular-nums text-xs">
                            {total}
                        </Badge>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsFilterDrawerOpen(true)}
                        className="h-8 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground border-border/80"
                        aria-label="Filtrar ciclos"
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
                    </Button>
                </div>

                {cyclesError ? (
                    <div className="px-4">
                        <ErrorView
                            title="Erro ao carregar ciclos do contrato"
                            error={cyclesError}
                        />
                    </div>
                ) : (
                    <ContractCycleList
                        items={items}
                        isPayable={isPayable}
                        isLoading={isLoadingProfile || isLoadingCycles}
                        isLoadingMore={isLoadingMore}
                        hasMore={hasMore}
                        sentinelRef={sentinelRef}
                        hasFilters={activeFilterCount > 0}
                        onClearFilters={clearFilters}
                        cycleActionContext={cycleActionContext}
                    />
                )}
            </div>

            {/* 3. Drawers & Modais */}
            <ContractCycleFilterDrawer
                open={isFilterDrawerOpen}
                onOpenChange={setIsFilterDrawerOpen}
                filters={filters}
                onApply={applyFilters}
                onClear={clearFilters}
            />

            <ArchiveContractModalViewMobile {...archiveContext} />
            <RestoreContractModalViewMobile {...restoreContext} />
        </div>
    );
}
