"use server";

import { ContractSummaryItem } from "../../core/schemas/contract.schema";
import { SessionHandler } from "@/modules/identity/infra/handlers/session.handler";
import { Result, failure, success } from "@/types/result.types";
import { prisma } from "@/lib/prisma";

export async function getContractByIdAction(id: number): Promise<Result<ContractSummaryItem>> {
  const session = await SessionHandler.getSession();
  if (!session) return failure("Não autenticado");

  try {
    const agreement = await prisma.agreement.findUnique({
      where: { id },
      include: {
        balance: true,
        rules: {
          orderBy: { effectiveFrom: "desc" },
          take: 1,
        },
        amountEntries: {
          orderBy: { effectiveAt: "asc" },
        },
      },
    });

    if (agreement?.balance?.contextId !== session.contextId) {
      return failure("Contrato não encontrado");
    }

    const currentRule = agreement.rules?.[0];
    const value = Math.max(
      0,
      agreement.amountEntries?.reduce((sum, e) => sum + e.amount, 0) ?? 0
    );

    const item: ContractSummaryItem = {
      id: agreement.id,
      balanceId: agreement.balance.id,
      name: agreement.balance.name,
      type: agreement.balance.balanceType as "PAYABLE" | "RECEIVABLE",
      value,
      frequency: (currentRule?.frequency as "WEEKLY" | "MONTHLY" | "YEARLY") ?? "MONTHLY",
      dueDay: currentRule?.dueDay ?? 1,
      startsAt: agreement.startsAt,
      endsAt: agreement.endsAt,
      includeInProjection: agreement.includeInProjection,
      isArchived: agreement.balance.removedAt !== null,
    };

    return success(item);
  } catch (error) {
    console.error("[getContractByIdAction] Erro ao carregar contrato:", error);
    return failure("Falha ao carregar contrato");
  }
}
