import { prisma } from "@/lib/prisma"
import {
  OperationExecutionDomainError,
  type IOperationPlanExecutor,
} from "../../application/interfaces/operation-plan-executor.interface"
import { resolveEntityRef } from "../../application/plan/compiler"
import type {
  OperationExecutionPlan,
  OperationExecutionResult,
  ResolvedNodeOutput,
} from "../../application/plan/types"
import {
  makeDefaultNodeActionRegistry,
  NodeActionRegistry,
} from "./handlers"

export class PrismaOperationPlanExecutor implements IOperationPlanExecutor {
  constructor(
    private readonly registry: NodeActionRegistry = makeDefaultNodeActionRegistry()
  ) {}

  async execute(
    contextId: number,
    plan: OperationExecutionPlan
  ): Promise<OperationExecutionResult> {
    return await prisma.$transaction(async (tx) => {
      const resolvedNodes: Record<string, ResolvedNodeOutput> = {}

      for (const node of plan.nodes) {
        const handler = this.registry.get(node.action.type)
        if (!handler) {
          throw new OperationExecutionDomainError(
            `Nenhum executor registrado para o comando "${node.action.type}".`,
            "UNHANDLED_NODE_ACTION"
          )
        }

        const output = await handler.execute({
          tx,
          contextId,
          action: node.action,
          resolvedNodes,
        })
        resolvedNodes[node.id] = output
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
}
