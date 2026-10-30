"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import { useArchiveRestore } from "@/hooks/use-archive-restore";
import { ContractProfileMobileProps, ContractProfileInput } from "../types";
import { useContractProfileData } from "../hooks/use-contract-profile-data";
import { useContractCycleFilters } from "../hooks/use-contract-cycle-filters";
import { useContractCyclesInfinite } from "../hooks/use-contract-cycles-data";
import { ContractSummaryItem } from "@/modules/contracts/models/contract.schema";
import { ContractCycleItem } from "@/modules/cycles/models/contract-cycle.schema";
import { archiveContractAction } from "@/modules/contracts/ui/actions/archive-contract.action";
import { restoreContractAction } from "@/modules/contracts/ui/actions/restore-contract.action";
import { toggleContractProjectionAction } from "@/modules/contracts/ui/actions/toggle-contract-projection.action";
import { ContractActionContext } from "../../../components/contract-actions-drawer";
import { ContractCycleActionContext } from "../../../components/contract-profile/contract-cycle-actions";

export function useContractProfileMobile({
    contractId,
    profile: initialProfile,
    initialCycles,
}: ContractProfileInput): ContractProfileMobileProps & { contractModalsContext?: any } {
    const router = useRouter();

    const [renameOpen, setRenameOpen] = useState(false);
    const [scheduleOpen, setScheduleOpen] = useState(false);
    const [limitsOpen, setLimitsOpen] = useState(false);
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

    // 1. Dados do perfil do contrato
    const {
        profile,
        isLoadingProfile,
        profileError,
        reloadProfile,
    } = useContractProfileData(contractId, initialProfile);

    // 2. Filtros sincronizados na URL
    const {
        filters,
        activeFilterCount,
        applyFilters,
        clearFilters,
    } = useContractCycleFilters();

    // 3. Paginação infinita dos ciclos
    const {
        items,
        total,
        hasMore,
        isLoading: isLoadingCycles,
        isLoadingMore,
        error: cyclesError,
        reload: reloadCycles,
        loadMore,
        sentinelRef,
    } = useContractCyclesInfinite(contractId, filters, 10, initialCycles);

    // 4. Modais de Arquivar e Restaurar
    const contractSummaryItem = useMemo<ContractSummaryItem | undefined>(() => {
        if (!profile) return undefined;
        return {
            id: profile.id,
            balanceId: profile.balanceId,
            name: profile.name,
            type: profile.type,
            value: profile.value,
            frequency: profile.frequency,
            dueDay: profile.dueDay,
            dueMonth: profile.dueMonth,
            startsAt: profile.startsAt,
            endsAt: profile.endsAt,
            includeInProjection: profile.includeInProjection,
            isArchived: profile.isArchived,
        };
    }, [profile]);

    const { archiveContext, restoreContext, onArchive, onRestore } =
        useArchiveRestore<ContractSummaryItem>({
            find: (item) => (contractSummaryItem?.id === item.id ? contractSummaryItem : undefined),
            entityName: "Contrato",
            onArchiveConfirm: async (contract) => {
                const result = await archiveContractAction(contract.id);
                if (!result.success) {
                    throw new Error(result.error);
                }
                await reloadProfile();
            },
            onRestoreConfirm: async (contract) => {
                const result = await restoreContractAction(contract.id);
                if (!result.success) {
                    throw new Error(result.error);
                }
                await reloadProfile();
            },
        });

    // 5. Contexto de ações do contrato
    const contractActionsContext = useMemo<ContractActionContext>(
        () => ({
            onRename: () => setRenameOpen(true),
            onAdjustSchedule: () => setScheduleOpen(true),
            onAdjustLimits: () => setLimitsOpen(true),
            onToggleProjection: async (c) => {
                if (c.isArchived) {
                    toast.add({
                        type: "error",
                        title: "Ação não permitida",
                        description: "Não é possível alterar a projeção de um contrato arquivado.",
                    });
                    return;
                }
                const nextState = !c.includeInProjection;
                const toastId = toast.add({
                    type: "loading",
                    title: "Atualizando projeção...",
                });
                try {
                    const result = await toggleContractProjectionAction(c.id, nextState);
                    if (!result.success) {
                        toast.update(toastId, {
                            type: "error",
                            title: "Erro ao atualizar projeção",
                            description: result.error,
                        });
                        return;
                    }
                    toast.update(toastId, {
                        type: "success",
                        title: "Sucesso",
                        description: nextState
                            ? "Contrato incluído na projeção."
                            : "Contrato pausado da projeção.",
                    });
                    await reloadProfile();
                    await reloadCycles();
                } catch {
                    toast.update(toastId, {
                        type: "error",
                        title: "Erro inesperado",
                        description: "Não foi possível atualizar a projeção.",
                    });
                }
            },
            onArchive,
            onRestore,
        }),
        [router, onArchive, onRestore, reloadProfile, reloadCycles]
    );

    const onModalSuccess = useCallback(async () => {
        await Promise.all([reloadProfile(), reloadCycles()]);
    }, [reloadProfile, reloadCycles]);

    const contractModalsContext = useMemo(
        () => ({
            rename: {
                isOpen: renameOpen,
                onClose: () => setRenameOpen(false),
                onSuccess: onModalSuccess,
            },
            schedule: {
                isOpen: scheduleOpen,
                onClose: () => setScheduleOpen(false),
                onSuccess: onModalSuccess,
            },
            limits: {
                isOpen: limitsOpen,
                onClose: () => setLimitsOpen(false),
                onSuccess: onModalSuccess,
            },
        }),
        [renameOpen, scheduleOpen, limitsOpen, onModalSuccess]
    );

    // 6. Contexto de ações do ciclo (por enquanto acionando toasts)
    const cycleActionContext = useMemo<ContractCycleActionContext>(
        () => ({
            onConsolidate: (cycle) => {
                toast.add({
                    type: "info",
                    title: "Consolidar ciclo",
                    description: `Consolidação do ciclo ${cycle.label} em desenvolvimento.`,
                });
            },
            onSettle: (cycle) => {
                toast.add({
                    type: "info",
                    title: "Liquidar ciclo",
                    description: `Liquidação do ciclo ${cycle.label} em desenvolvimento.`,
                });
            },
            onAdjustValue: (cycle) => {
                toast.add({
                    type: "info",
                    title: "Ajustar valor",
                    description: `Ajuste de valor do ciclo ${cycle.label} em desenvolvimento.`,
                });
            },
            onDiscard: (cycle) => {
                toast.add({
                    type: "info",
                    title: "Descartar ciclo",
                    description: `Descarte do ciclo ${cycle.label} em desenvolvimento.`,
                });
            },
        }),
        []
    );

    const onCycleClick = useCallback(
        (cycle: ContractCycleItem) => {
            const targetContractId = cycle.contractId ?? contractId;
            router.push(
                `/contracts/${targetContractId}/cycle?from=${cycle.from}&to=${cycle.to}`
            );
        },
        [router, contractId]
    );

    return {
        profile,
        isLoadingProfile,
        profileError,
        reloadProfile,
        contractActionsContext,
        archiveContext,
        restoreContext,
        items,
        total,
        hasMore,
        isLoadingCycles,
        isLoadingMore,
        cyclesError,
        reloadCycles,
        loadMore,
        sentinelRef,
        filters,
        activeFilterCount,
        applyFilters,
        clearFilters,
        isFilterDrawerOpen,
        setIsFilterDrawerOpen,
        cycleActionContext,
        contractModalsContext,
        onCycleClick,
    } as any;
}
