import { OperationExecutionDomainError } from "../../../application/interfaces/operation-plan-executor.interface"
import { resolveEntityRef } from "../../../application/plan/compiler"
import type { ResolvedNodeOutput } from "../../../application/plan/types"
import type {
  NodeActionExecutionContext,
  NodeActionHandler,
} from "./node-action-handler.interface"

export class CreateDirectEntryHandler
  implements NodeActionHandler<"CREATE_DIRECT_ENTRY">
{
  readonly type = "CREATE_DIRECT_ENTRY" as const

  async execute({
    tx,
    contextId,
    action,
    resolvedNodes,
  }: NodeActionExecutionContext<
    Extract<import("../../../application/plan/types").OperationNodeAction, { type: "CREATE_DIRECT_ENTRY" }>
  >): Promise<ResolvedNodeOutput> {
    const custodyBalanceId = resolveEntityRef(action.custody, resolvedNodes)
    if (!custodyBalanceId) {
      throw new OperationExecutionDomainError(
        "Meio de pagamento não resolvido para o lançamento.",
        "MISSING_CUSTODY"
      )
    }

    const counterpartBalanceId = resolveEntityRef(
      action.counterpart,
      resolvedNodes
    )
    if (!counterpartBalanceId) {
      throw new OperationExecutionDomainError(
        "Categoria/contraparte não resolvida para o lançamento.",
        "MISSING_COUNTERPART"
      )
    }

    const [custodyBalance, counterpartBalance] = await Promise.all([
      tx.balance.findFirst({
        where: {
          id: custodyBalanceId,
          contextId,
          removedAt: null,
        },
        select: { id: true, balanceType: true },
      }),
      tx.balance.findFirst({
        where: {
          id: counterpartBalanceId,
          contextId,
          removedAt: null,
        },
        select: { id: true, balanceType: true },
      }),
    ])

    if (!custodyBalance) {
      throw new OperationExecutionDomainError(
        "Meio de pagamento não encontrado ou arquivado neste contexto.",
        "CUSTODY_NOT_FOUND"
      )
    }

    if (!counterpartBalance) {
      throw new OperationExecutionDomainError(
        "Categoria de contraparte não encontrada ou arquivada neste contexto.",
        "COUNTERPART_NOT_FOUND"
      )
    }

    const absAmount = Math.abs(Math.round(action.amountCents))
    const isPay = action.nature === "PAY"
    const custodyDirection = isPay ? "DEBIT" : "CREDIT"
    const custodySignedAmount = isPay ? -absAmount : absAmount
    const counterpartDirection = isPay ? "CREDIT" : "DEBIT"
    const counterpartSignedAmount = -custodySignedAmount

    const dueDate = new Date(action.dueDate)
    const competanceDate = action.competanceDate
      ? new Date(action.competanceDate)
      : dueDate

    const entry = await tx.entry.create({
      data: {
        description: action.description.trim(),
        type: "DIRECT",
        dueDate,
        competanceDate,
        movements: {
          create: [
            {
              balanceId: custodyBalance.id,
              amount: custodySignedAmount,
              direction: custodyDirection,
            },
            {
              balanceId: counterpartBalance.id,
              amount: counterpartSignedAmount,
              direction: counterpartDirection,
            },
          ],
        },
      },
      select: { id: true },
    })

    return { id: entry.id }
  }
}

