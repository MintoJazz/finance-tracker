import { CategoryPolicy } from "@/modules/categories/application/policies/category.policy"
import type { CategoryEntity } from "@/modules/categories/models/category.schema"
import { resolveEntityRef } from "../../../application/plan/compiler"
import type { ResolvedNodeOutput } from "../../../application/plan/types"
import type {
  NodeActionExecutionContext,
  NodeActionHandler,
} from "./node-action-handler.interface"

export class CreateCategoryBalanceHandler
  implements NodeActionHandler<"CREATE_CATEGORY_BALANCE">
{
  readonly type = "CREATE_CATEGORY_BALANCE" as const

  async execute({
    tx,
    contextId,
    action,
    resolvedNodes,
  }: NodeActionExecutionContext<
    Extract<import("../../../application/plan/types").OperationNodeAction, { type: "CREATE_CATEGORY_BALANCE" }>
  >): Promise<ResolvedNodeOutput> {
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
}

