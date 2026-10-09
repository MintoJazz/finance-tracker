"use server";

import { Page } from "@/types/pagination.types";
import { ContractSummaryItem, ContractTypeCounts, ContractFilters } from "../../core/schemas/contract.schema";
import { PlanningFactory } from "../../infra/factories/planning.factory";
import { SessionHandler } from "@/modules/identity/infra/handlers/session.handler";

export async function getContractsOverviewAction(
  contextId: number,
  filters: ContractFilters
): Promise<{ page: Page<ContractSummaryItem>; counts: ContractTypeCounts }> {
  const session = await SessionHandler.getSession();
  if (!session) throw new Error("Não autenticado");

  const useCase = PlanningFactory.makeGetContextContractsUseCase();
  const result = await useCase.execute({
    session,
    pageRequest: { page: filters.page ?? 1, pageSize: filters.pageSize ?? 10 },
    filter: filters
  });

  if (!result.success || !result.data) {
    throw new Error(result.error ?? "Falha ao carregar contratos");
  }

  return result.data;
}
