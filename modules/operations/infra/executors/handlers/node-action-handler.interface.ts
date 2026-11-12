import { prisma } from "@/lib/prisma"
import type {
  OperationNodeAction,
  ResolvedNodeOutput,
} from "../../../application/plan/types"

export type PrismaTransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0]

export interface NodeActionExecutionContext<
  TAction extends OperationNodeAction = OperationNodeAction,
> {
  readonly tx: PrismaTransactionClient
  readonly contextId: number
  readonly action: TAction
  readonly resolvedNodes: Readonly<Record<string, ResolvedNodeOutput>>
}

export interface NodeActionHandler<
  TType extends OperationNodeAction["type"] = OperationNodeAction["type"],
> {
  readonly type: TType
  execute(
    context: NodeActionExecutionContext<
      Extract<OperationNodeAction, { type: TType }>
    >
  ): Promise<ResolvedNodeOutput>
}

