import { OperationExecutionDomainError } from "../../../application/interfaces/operation-plan-executor.interface"
import { resolveEntityRef } from "../../../application/plan/compiler"
import type { ResolvedNodeOutput, SettleObligationAction } from "../../../application/plan/types"
import type {
  NodeActionExecutionContext,
  NodeActionHandler,
} from "./node-action-handler.interface"

function parseSafeUtcDate(isoDateStr: string): Date {
  const parts = isoDateStr.split("-").map(Number)
  if (parts.length === 3 && !parts.some(isNaN)) {
    return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 12, 0, 0))
  }
  return new Date(isoDateStr)
}

export class SettleObligationHandler
  implements NodeActionHandler<"SETTLE_OBLIGATION">
{
  readonly type = "SETTLE_OBLIGATION" as const

  async execute({
    tx,
    contextId,
    action,
    resolvedNodes,
  }: NodeActionExecutionContext<
    Extract<
      import("../../../application/plan/types").OperationNodeAction,
      { type: "SETTLE_OBLIGATION" }
    >
  >): Promise<ResolvedNodeOutput> {
    const custodyBalanceId = resolveEntityRef(action.custody, resolvedNodes)
    if (!custodyBalanceId) {
      throw new OperationExecutionDomainError(
        "Meio de pagamento não resolvido para quitação da obrigação.",
        "MISSING_CUSTODY"
      )
    }

    const [custodyBalance, agreementBalance] = await Promise.all([
      tx.balance.findFirst({
        where: {
          id: custodyBalanceId,
          contextId,
          removedAt: null,
        },
        select: { id: true, name: true, balanceType: true },
      }),
      tx.balance.findFirst({
        where: {
          id: action.agreementId,
          contextId,
          removedAt: null,
        },
        include: {
          agreement: {
            include: {
              rules: true,
            },
          },
        },
      }),
    ])

    if (!custodyBalance) {
      throw new OperationExecutionDomainError(
        "Conta de pagamento não encontrada ou arquivada neste contexto.",
        "CUSTODY_NOT_FOUND"
      )
    }

    if (!agreementBalance || !agreementBalance.agreement) {
      throw new OperationExecutionDomainError(
        "Contrato ou cartão não encontrado neste contexto.",
        "AGREEMENT_NOT_FOUND"
      )
    }

    // Regra: se a obrigação for cartão de crédito, não pode pagar com cartão de crédito
    if (
      agreementBalance.balanceType === "CREDIT" &&
      custodyBalance.balanceType === "CREDIT"
    ) {
      throw new OperationExecutionDomainError(
        "Não é permitido pagar fatura de cartão de crédito utilizando outro cartão de crédito.",
        "CIRCULAR_CREDIT_SETTLEMENT"
      )
    }

    if (
      action.nature === "RECEIVE" &&
      custodyBalance.balanceType === "CREDIT"
    ) {
      throw new OperationExecutionDomainError(
        "Cartão de crédito não é permitido como conta de destino em recebimentos.",
        "INVALID_CUSTODY_FOR_RECEIVE"
      )
    }

    if (!action.allocations || action.allocations.length === 0) {
      throw new OperationExecutionDomainError(
        "Nenhum ciclo selecionado para quitação.",
        "EMPTY_ALLOCATIONS"
      )
    }

    // Categoria de contraparte padrão para o contrato (se houver reconhecimento)
    let categoryBalanceId = agreementBalance.parentId
    if (!categoryBalanceId) {
      const fallbackCat = await tx.balance.findFirst({
        where: {
          contextId,
          balanceType: "CATEGORY",
          removedAt: null,
        },
        select: { id: true },
      })
      categoryBalanceId = fallbackCat?.id ?? null
    }

    const paymentDate = parseSafeUtcDate(action.dueDate)
    const isPay = action.nature === "PAY"
    let firstCreatedEntryId: number | null = null

    for (const alloc of action.allocations) {
      const absAmount = Math.abs(Math.round(alloc.amount))
      if (absAmount <= 0) continue

      const referenceDate = parseSafeUtcDate(alloc.referenceDate)
      const isProjectedCycle =
        alloc.status === "PROJECTED" || alloc.status === "UNRECORDED"

      // Se o ciclo for puramente projetado/não lançado, emite o reconhecimento prévio na categoria
      if (isProjectedCycle && categoryBalanceId) {
        if (agreementBalance.balanceType === "PAYABLE") {
          await tx.entry.create({
            data: {
              description: `Reconhecimento de obrigação - ${agreementBalance.name}`,
              type: "ACCRUAL",
              dueDate: referenceDate,
              competanceDate: referenceDate,
              movements: {
                create: [
                  {
                    balanceId: agreementBalance.id,
                    amount: -absAmount,
                    direction: "DEBIT",
                  },
                  {
                    balanceId: categoryBalanceId,
                    amount: absAmount,
                    direction: "CREDIT",
                  },
                ],
              },
            },
          })
        } else if (agreementBalance.balanceType === "RECEIVABLE") {
          await tx.entry.create({
            data: {
              description: `Reconhecimento de direito - ${agreementBalance.name}`,
              type: "CLAIM_OPENING",
              dueDate: referenceDate,
              competanceDate: referenceDate,
              movements: {
                create: [
                  {
                    balanceId: agreementBalance.id,
                    amount: absAmount,
                    direction: "CREDIT",
                  },
                  {
                    balanceId: categoryBalanceId,
                    amount: -absAmount,
                    direction: "DEBIT",
                  },
                ],
              },
            },
          })
        }
      }

      // Emite lançamento de quitação (SETTLEMENT unificado para liquidação de passivo e ativo)
      const settlementType = "SETTLEMENT"
      const custodyDirection = isPay ? "DEBIT" : "CREDIT"
      const custodySignedAmount = isPay ? -absAmount : absAmount
      const agreementDirection = isPay ? "CREDIT" : "DEBIT"
      const agreementSignedAmount = isPay ? absAmount : -absAmount

      const settlementDescription =
        action.description?.trim() ||
        (isPay
          ? `Quitação - ${agreementBalance.name}`
          : `Recebimento - ${agreementBalance.name}`)

      const entry = await tx.entry.create({
        data: {
          description: settlementDescription,
          type: settlementType,
          dueDate: paymentDate,
          competanceDate: referenceDate,
          movements: {
            create: [
              {
                balanceId: custodyBalance.id,
                amount: custodySignedAmount,
                direction: custodyDirection,
              },
              {
                balanceId: agreementBalance.id,
                amount: agreementSignedAmount,
                direction: agreementDirection,
              },
            ],
          },
        },
        select: { id: true },
      })

      if (firstCreatedEntryId === null) {
        firstCreatedEntryId = entry.id
      }
    }

    if (!firstCreatedEntryId) {
      throw new OperationExecutionDomainError(
        "Nenhuma alocação válida foi processada.",
        "NO_ENTRIES_CREATED"
      )
    }

    return { id: firstCreatedEntryId }
  }
}

