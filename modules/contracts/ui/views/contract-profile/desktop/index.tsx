"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ErrorView } from "@/components/error-view";
import { X } from "lucide-react";
import { ContractProfileDesktopProps } from "../types";
import { ArchiveContractModalViewDesktop } from "../../archive-contract-modal";
import { RestoreContractModalViewDesktop } from "../../restore-contract-modal";
import ContractCycleFiltersForm from "../../../components/contract-profile/contract-cycle-filters-form";
import ContractCycleTable from "../../../components/contract-profile/contract-cycle-table";
import ContractProfileCard from "../../../components/contract-profile/contract-profile-card";
import ContractProfileSkeleton from "../../../components/contract-profile/skeletons/contract-profile-skeleton";
import { RenameContractModalConfig } from "../../rename-contract-modal";
import { AdjustContractScheduleModalConfig } from "../../adjust-contract-schedule-modal";
import { AdjustContractLimitsModalConfig } from "../../adjust-contract-limits-modal";

const RenameContractModal = RenameContractModalConfig.views.desktop.View;
const useRenameContractModal = RenameContractModalConfig.views.desktop.hook;
const AdjustContractScheduleModal = AdjustContractScheduleModalConfig.views.desktop.View;
const useAdjustContractScheduleModal = AdjustContractScheduleModalConfig.views.desktop.hook;
const AdjustContractLimitsModal = AdjustContractLimitsModalConfig.views.desktop.View;
const useAdjustContractLimitsModal = AdjustContractLimitsModalConfig.views.desktop.hook;

export default function ContractProfileViewDesktop({
    profile,
    isLoadingProfile,
    profileError,
    contractActionsContext,
    archiveContext,
    restoreContext,
    cyclesData,
    isLoadingCycles,
    cyclesError,
    filters,
    activeFilterCount,
    applyFilters,
    clearFilters,
    paginationContext,
    cycleActionContext,
    contractModalsContext,
    onCycleClick,
}: ContractProfileDesktopProps) {
    const renameModalProps = useRenameContractModal(
        profile
            ? ({
                  isOpen: contractModalsContext?.rename?.isOpen ?? false,
                  contractId: profile.id,
                  contractName: profile.name,
                  onClose: contractModalsContext?.rename?.onClose ?? (() => {}),
                  onSuccess: contractModalsContext?.rename?.onSuccess,
              } as any)
            : ({} as any)
    );

    const scheduleModalProps = useAdjustContractScheduleModal(
        profile
            ? ({
                  isOpen: contractModalsContext?.schedule?.isOpen ?? false,
                  contractId: profile.id,
                  contractName: profile.name,
                  initialDueDay: profile.dueDay,
                  initialClosingDay: profile.closingDay ?? null,
                  initialDueMonth: profile.dueMonth ?? null,
                  initialClosingMonth: profile.closingMonth ?? null,
                  frequency: profile.frequency,
                  onClose: contractModalsContext?.schedule?.onClose ?? (() => {}),
                  onSuccess: contractModalsContext?.schedule?.onSuccess,
              } as any)
            : ({} as any)
    );

    const limitsModalProps = useAdjustContractLimitsModal(
        profile
            ? ({
                  isOpen: contractModalsContext?.limits?.isOpen ?? false,
                  contractId: profile.id,
                  contractName: profile.name,
                  initialValue: profile.value,
                  onClose: contractModalsContext?.limits?.onClose ?? (() => {}),
                  onSuccess: contractModalsContext?.limits?.onSuccess,
              } as any)
            : ({} as any)
    );
    if (profileError) {
        return (
            <ErrorView
                title="Erro ao carregar contrato"
                error={profileError}
            />
        );
    }

    return (
        <div className="w-full max-w-5xl lg:max-w-6xl mx-auto flex flex-col gap-5 p-4 md:p-6 lg:p-8 lg:py-2 min-w-0">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_310px] xl:grid-cols-[minmax(0,1fr)_330px] items-start gap-6 w-full min-w-0">
                {/* Coluna Esquerda: Listagem de Ciclos */}
                <main className="min-w-0 w-full flex flex-col gap-3.5">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <h2 className="text-base font-semibold tracking-tight text-foreground">
                                Ciclos do Contrato
                            </h2>
                            <Badge variant="outline" className="tabular-nums text-xs">
                                {cyclesData?.total ?? 0}
                            </Badge>
                        </div>
                        {activeFilterCount > 0 && (
                            <span className="text-xs text-muted-foreground">
                                {activeFilterCount}{" "}
                                {activeFilterCount === 1 ? "filtro ativo" : "filtros ativos"}
                            </span>
                        )}
                    </div>

                    {cyclesError ? (
                        <ErrorView
                            title="Erro ao carregar ciclos do contrato"
                            error={cyclesError}
                        />
                    ) : (
                        <ContractCycleTable
                            data={cyclesData}
                            isLoading={isLoadingProfile || isLoadingCycles}
                            hasFilters={activeFilterCount > 0}
                            onClearFilters={clearFilters}
                            setPage={paginationContext.setPage}
                            setPageSize={paginationContext.setPageSize}
                            cycleActionContext={cycleActionContext}
                            onRowClick={onCycleClick}
                        />
                    )}
                </main>

                {/* Coluna Direita: Sticky Sidebar com Perfil do Contrato + Filtros */}
                <aside className="w-full flex flex-col gap-5 lg:sticky lg:top-6 min-w-0">
                    {isLoadingProfile || !profile ? (
                        <ContractProfileSkeleton />
                    ) : (
                        <ContractProfileCard
                            contract={profile}
                            contractActionsContext={contractActionsContext}
                        >
                            <div className="border-t border-border/40 mx-4 sm:mx-4.5" />

                            {/* Filtros dos Ciclos */}
                            <div className="px-4 sm:px-4.5 pb-4 pt-3 flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Filtros dos ciclos
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
                                            Limpar
                                        </Button>
                                    )}
                                </div>
                                <ContractCycleFiltersForm
                                    values={filters}
                                    onChange={applyFilters}
                                    onReset={clearFilters}
                                    hideResetButton
                                />
                            </div>
                        </ContractProfileCard>
                    )}
                </aside>
            </div>

            <ArchiveContractModalViewDesktop {...archiveContext} />
            <RestoreContractModalViewDesktop {...restoreContext} />
            <RenameContractModal {...renameModalProps} />
            <AdjustContractScheduleModal {...scheduleModalProps} />
            <AdjustContractLimitsModal {...limitsModalProps} />
        </div>
    );
}
