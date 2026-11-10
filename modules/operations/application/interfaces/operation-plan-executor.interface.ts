import type {
  OperationExecutionPlan,
  OperationExecutionResult,
} from "../plan/types"

export class OperationExecutionDomainError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message)
    this.name = "OperationExecutionDomainError"
  }
}

export interface IOperationPlanExecutor {
  execute(
    contextId: number,
    plan: OperationExecutionPlan
  ): Promise<OperationExecutionResult>
}

