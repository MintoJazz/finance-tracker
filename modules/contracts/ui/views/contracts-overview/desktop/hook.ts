"use client";

import { useMemo, useState, useTransition } from "react";
import { useQueryParams } from "@/hooks/use-query-params";
import { useOverviewFilters } from "@/hooks/use-overview-filters";
import { ContractsOverviewProps } from "../types";
import { Page } from "@/types/pagination.types";
import { ContractSummaryItem, ContractTypeCounts } from "@/modules/contracts/models/contract.schema";
import { usePaginationQueryParams } from "@/hooks/use-pagination-query-params";
import { archiveContractAction } from "@/modules/contracts/ui/actions/archive-contract.action";
import { toggleContractProjectionAction } from "@/modules/contracts/ui/actions/toggle-contract-projection.action";
import { toast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { useArchiveRestore } from "@/hooks/use-archive-restore";
import { Result } from "@/types/result.types";

export function useContractsOverview(data: { page: Page<ContractSummaryItem>; counts: ContractTypeCounts }): ContractsOverviewProps {
  const [, startTransition] = useTransition();
  const router = useRouter();

  const { filterContext: baseFilterContext } = useOverviewFilters();
  const { getParam, setParam } = useQueryParams();
  const type = getParam("type") || "ALL";
  const setType = (val: string) => setParam("type", val);

  const { paginationContext } = usePaginationQueryParams();

  const [renameState, setRenameState] = useState<{ open: boolean; contract: ContractSummaryItem | null }>({
    open: false,
    contract: null,
  });
  const [scheduleState, setScheduleState] = useState<{ open: boolean; contract: ContractSummaryItem | null }>({
    open: false,
    contract: null,
  });
  const [limitsState, setLimitsState] = useState<{ open: boolean; contract: ContractSummaryItem | null }>({
    open: false,
    contract: null,
  });

  const onAddClick = () => {
    router.push("/contracts/create");
  };

  const handleAction = (promise: Promise<Result<void>>, successMessage: string) => {
    const toastId = toast.add({
      type: "loading",
      title: "Processando...",
    });

    promise
      .then((result) => {
        if (!result.success) {
          toast.update(toastId, {
            type: "error",
            title: "Ocorreu um erro",
            description: result.error,
          });
          return;
        }

        startTransition(() => {
          router.refresh();
        });
        toast.update(toastId, {
          type: "success",
          title: "Sucesso",
          description: successMessage,
        });
      })
      .catch((error) => {
        toast.update(toastId, {
          type: "error",
          title: "Ocorreu um erro",
          description: error instanceof Error ? error.message : "Erro desconhecido",
        });
      });
  };

  const { archiveContext, onArchive } = useArchiveRestore<ContractSummaryItem>({
    find: (item) => data.page.data.find((c) => c.id === item.id),
    entityName: "Contrato",
    onArchiveConfirm: async (contract) => {
      const result = await archiveContractAction(contract.id);
      if (!result.success) throw new Error(result.error);
    },
  });

  const actionsMenuContext = {
    onToggleProjection: (contract: ContractSummaryItem) => {
      if (contract.isArchived) {
        toast.add({
          type: "error",
          title: "Ação não permitida",
          description: "Não é possível alterar a projeção de um contrato arquivado.",
        });
        return;
      }
      const nextState = !contract.includeInProjection;
      handleAction(
        toggleContractProjectionAction(contract.id, nextState),
        nextState
          ? "Contrato incluído na projeção com sucesso."
          : "Contrato pausado da projeção com sucesso."
      );
    },
    onArchive,
    onRename: (contract: ContractSummaryItem) => {
      setRenameState({ open: true, contract });
    },
    onAdjustSchedule: (contract: ContractSummaryItem) => {
      setScheduleState({ open: true, contract });
    },
    onAdjustLimits: (contract: ContractSummaryItem) => {
      setLimitsState({ open: true, contract });
    },
  };

  const filterContext = {
    ...baseFilterContext,
    typeProps: { value: type, onValueChange: setType },
  };

  const modalsContext = useMemo(
    () => ({
      rename: {
        isOpen: renameState.open,
        contract: renameState.contract,
        onClose: () => setRenameState({ open: false, contract: null }),
      },
      schedule: {
        isOpen: scheduleState.open,
        contract: scheduleState.contract,
        onClose: () => setScheduleState({ open: false, contract: null }),
      },
      limits: {
        isOpen: limitsState.open,
        contract: limitsState.contract,
        onClose: () => setLimitsState({ open: false, contract: null }),
      },
    }),
    [renameState, scheduleState, limitsState]
  );

  return {
    data: data.page,
    counts: data.counts,
    onAddClick,
    actionsMenuContext,
    filterContext,
    paginationContext,
    archiveContext,
    modalsContext,
  } as ContractsOverviewProps & { modalsContext: typeof modalsContext };
}
