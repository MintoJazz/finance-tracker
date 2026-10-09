"use client";

import { useQueryParams } from "@/hooks/use-query-params";
import { useOverviewFilters } from "@/hooks/use-overview-filters";
import { ContractsOverviewProps } from "../types";
import { Page } from "@/types/pagination.types";
import { ContractSummaryItem, ContractTypeCounts } from "../../../../core/schemas/contract.schema";
import { usePaginationQueryParams } from "@/hooks/use-pagination-query-params";
import { archiveContractAction } from "../../../actions/archive-contract.action";
import { restoreContractAction } from "../../../actions/restore-contract.action";
import { toggleContractProjectionAction } from "../../../actions/toggle-contract-projection.action";
import { toast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
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

  const { archiveContext, restoreContext, onArchive, onRestore } = useArchiveRestore<ContractSummaryItem>({
    find: (item) => data.page.data.find((c) => c.id === item.id),
    entityName: "Contrato",
    onArchiveConfirm: async (contract) => {
      const result = await archiveContractAction(contract.id);
      if (!result.success) throw new Error(result.error);
    },
    onRestoreConfirm: async (contract) => {
      const result = await restoreContractAction(contract.id);
      if (!result.success) throw new Error(result.error);
    },
  });

  const actionsMenuContext = {
    onEdit: (contract: ContractSummaryItem) => {
      router.push(`/contracts/${contract.id}/edit`);
    },
    onToggleProjection: (contract: ContractSummaryItem) => {
      if (contract.isArchived) {
        console.warn(`[ContractsOverview] Tentativa de ativar/pausar o contrato arquivado: ${contract.id}`);
        toast.add({
          type: "error",
          title: "Ação não permitida",
          description: "Não é possível ativar um contrato arquivado.",
        });
        return;
      }
      handleAction(
        toggleContractProjectionAction(contract.id, contract.includeInProjection),
        contract.includeInProjection ? "Contrato ativado com sucesso." : "Contrato pausado com sucesso."
      );
    },
    onArchive,
    onRestore,
  };

  const filterContext = {
    ...baseFilterContext,
    typeProps: { value: type, onValueChange: setType },
  };

  return {
    data: data.page,
    counts: data.counts,
    onAddClick,
    actionsMenuContext,
    filterContext,
    paginationContext,
    archiveContext,
    restoreContext,
  };
}
