import type { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils"
import { CategoryDomainError } from "@/modules/categories/application/policies/category.policy"
import type { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface"
import { failure, success, type Result } from "@/types/result.types"
import {
  createOperationInputSchema,
  type OperationDraft,
  type OperationIntentKey,
} from "../../models/operation-input.schema"
import type { OperationSeed } from "../../models/operation-seed.schema"
import { OPERATION_STEP_CATALOG } from "../intents/catalog"
import {
  OperationExecutionDomainError,
  type IOperationPlanExecutor,
} from "../interfaces/operation-plan-executor.interface"
import { compileOperationPlan } from "../plan/compiler"
import type { OperationExecutionResult } from "../plan/types"
import type { OperationStepCatalog } from "../steps/interpreter"

export interface ExecuteOperationUseCaseDTO {
  readonly session: SessionPayload
  readonly payload: Partial<OperationDraft>
  readonly seed?: OperationSeed
}

export class ExecuteOperationUseCase {
  constructor(
    private readonly getSpaceAccess: ISpaceAccessProvider,
    private readonly planExecutor: IOperationPlanExecutor,
    private readonly catalog: OperationStepCatalog<OperationIntentKey> = OPERATION_STEP_CATALOG
  ) {}

  async execute({
    session,
    payload,
    seed = {},
  }: ExecuteOperationUseCaseDTO): Promise<Result<OperationExecutionResult>> {
    try {
      const {
        success: accessSuccess,
        data: accessData,
        error,
      } = await this.getSpaceAccess.execute(session)

      if (!accessSuccess || !accessData) {
        return failure(error ?? "Acesso negado ao contexto financeiro")
      }

      if (!accessData.canManageBalances) {
        return failure(
          "Sem permissão para executar operações financeiras neste contexto!"
        )
      }

      const schema = createOperationInputSchema(this.catalog, seed)
      const parsed = schema.safeParse(payload)
      if (!parsed.success) {
        const firstIssue = parsed.error.issues[0]
        return failure(
          firstIssue?.message ?? "Dados da operação inválidos."
        )
      }

      const validatedDraft = parsed.data as unknown as Partial<OperationDraft>
      const plan = compileOperationPlan(validatedDraft, this.catalog)

      const result = await this.planExecutor.execute(session.contextId, plan)
      return success(result)
    } catch (err) {
      if (
        err instanceof OperationExecutionDomainError ||
        err instanceof CategoryDomainError
      ) {
        return failure(err.message)
      }
      console.error("[ExecuteOperationUseCase] Erro inesperado:", err)
      return failure("Ocorreu um erro interno ao executar a operação.")
    }
  }
}

