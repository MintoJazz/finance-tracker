"use client";

import { useQueryParams } from "@/hooks/use-query-params";
import { useOverviewFilters } from "@/hooks/use-overview-filters";
import { Page } from "@/types/pagination.types";
import { ContractSummaryItem, ContractTypeCounts } from "../../../../core/schemas/contract.schema";
import { MobileContractsOverviewProps } from "../types";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { getContractsOverviewAction } from "../../../actions/get-contracts-overview.action";
import { toggleContractProjectionAction } from "../../../actions/toggle-contract-projection.action";
import { archiveContractAction } from "../../../actions/archive-contract.action";
import { restoreContractAction } from "../../../actions/restore-contract.action";
import { toast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { useTransition, useMemo, useCallback } from "react";
import { useArchiveRestore } from "@/hooks/use-archive-restore";
import { Result } from "@/types/result.types";

export function useMobileContractsOverview(data: { page: Page<ContractSummaryItem>; counts: ContractTypeCounts }): MobileContractsOverviewProps {
  const [, startTransition] = useTransition();
  const router = useRouter();

  const { debouncedSearch, filterContext: baseFilterContext } = useOverviewFilters();
  const { getParam, setParam } = useQueryParams();
  const type = getParam("type") || "ALL";
  const setType = (val: string) => setParam("type", val);

  const {
    items,
    total,
    hasMore,
    isLoadingMore,
    loadMore,
    sentinelRef,
  } = useInfiniteScroll({
    data: data.page,
    fetchNextPage: async (pageRequest) => {
      const result = await getContractsOverviewAction(1, { // contextId mocked as 1
        search: debouncedSearch || undefined,
        type: type as "ALL" | "PAYABLE" | "RECEIVABLE",
        showArchived: baseFilterContext.showArchived.pressed,
        page: pageRequest.page,
        pageSize: pageRequest.pageSize,
      });

      if (!result) {
        toast.add({
          type: "error",
          title: "Erro ao carregar contratos",
        });
        return null;
      }
      return result.page;
    },
  });

  const onAddClick = () => {
    router.push("/contracts/create");
  };

  const handleAction = useCallback((promise: Promise<Result<void>>, successMessage: string) => {
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
  }, [router]);

  const { archiveContext, restoreContext, onArchive, onRestore } = useArchiveRestore<ContractSummaryItem>({
    find: (item) => data.page.data.find((c) => c.id === item.id) || items.find((c) => c.id === item.id),
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

  const actionsMenuContext = useMemo(() => ({
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
  }), [handleAction, onArchive, onRestore, router]);

  const filterContext = {
    ...baseFilterContext,
    typeProps: { value: type, onValueChange: setType },
  };

  return {
    items,
    counts: data.counts,
    total,
    hasMore,
    isLoadingMore,
    loadMore,
    sentinelRef,
    actionsMenuContext,
    filterContext,
    onAddClick,
    archiveContext,
    restoreContext,
  };
}
