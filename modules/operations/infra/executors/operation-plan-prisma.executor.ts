import { prisma } from "@/lib/prisma"
import { CategoryPolicy } from "@/modules/categories/application/policies/category.policy"
import type { CategoryEntity } from "@/modules/categories/models/category.schema"
import {
  OperationExecutionDomainError,
  type IOperationPlanExecutor,
} from "../../application/interfaces/operation-plan-executor.interface"
import { resolveEntityRef } from "../../application/plan/compiler"
import type {
  CreateCategoryBalanceAction,
  CreateDirectEntryAction,
  OperationExecutionPlan,
  OperationExecutionResult,
  ResolvedNodeOutput,
} from "../../application/plan/types"

type PrismaTransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0]

export class PrismaOperationPlanExecutor implements IOperationPlanExecutor {
  async execute(
    contextId: number,
    plan: OperationExecutionPlan
  ): Promise<OperationExecutionResult> {
    return await prisma.$transaction(async (tx) => {
      const resolvedNodes: Record<string, ResolvedNodeOutput> = {}

      for (const node of plan.nodes) {
        switch (node.action.type) {
          case "CREATE_CATEGORY_BALANCE": {
            const output = await this.executeCreateCategoryBalance(
              tx,
              contextId,
              node.action,
              resolvedNodes
            )
            resolvedNodes[node.id] = output
            break
          }
          case "CREATE_DIRECT_ENTRY": {
            const output = await this.executeCreateDirectEntry(
              tx,
              contextId,
              node.action,
              resolvedNodes
            )
            resolvedNodes[node.id] = output
            break
          }
        }
      }

      return {
        nodes: resolvedNodes,
        resolved: {
          mainEntryId: resolveEntityRef(plan.pointers.mainEntry, resolvedNodes),
          custodyBalanceId: resolveEntityRef(
            plan.pointers.custody,
            resolvedNodes
          ),
          categoryRootId: resolveEntityRef(
            plan.pointers.categoryRoot,
            resolvedNodes
          ),
          counterpartBalanceId: resolveEntityRef(
            plan.pointers.counterpart,
            resolvedNodes
          ),
        },
      }
    })
  }

  private async executeCreateCategoryBalance(
    tx: PrismaTransactionClient,
    contextId: number,
    action: CreateCategoryBalanceAction,
    resolvedNodes: Readonly<Record<string, ResolvedNodeOutput>>
  ): Promise<ResolvedNodeOutput> {
    const parentId = resolveEntityRef(action.parent, resolvedNodes)
    let parentEntity: CategoryEntity | null = null

    if (parentId !== null) {
      const parentRecord = await tx.balance.findFirst({
        where: {
          id: parentId,
          contextId,
          balanceType: "CATEGORY",
        },
        select: {
          id: true,
          name: true,
          contextId: true,
          parentId: true,
          removedAt: true,
        },
      })

      if (parentRecord) {
        parentEntity = {
          id: parentRecord.id,
          name: parentRecord.name,
          contextId: parentRecord.contextId,
          parentId: parentRecord.parentId,
          removedAt: parentRecord.removedAt,
          isArchived: parentRecord.removedAt !== null,
        }
      }
    }

    CategoryPolicy.validateCanCreateCategory(
      {
        name: action.name,
        parentId,
      },
      parentEntity
    )

    const hasAppearance = Boolean(action.icon || action.color)
    const created = await tx.balance.create({
      data: {
        contextId,
        name: action.name.trim(),
        balanceType: "CATEGORY",
        parentId,
        appearance: hasAppearance
          ? {
              create: {
                icon: action.icon ?? null,
                color: action.color ?? null,
              },
            }
          : undefined,
      },
      select: { id: true },
    })

    return { id: created.id }
  }

  private async executeCreateDirectEntry(
    tx: PrismaTransactionClient,
    contextId: number,
    action: CreateDirectEntryAction,
    resolvedNodes: Readonly<Record<string, ResolvedNodeOutput>>
  ): Promise<ResolvedNodeOutput> {
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

