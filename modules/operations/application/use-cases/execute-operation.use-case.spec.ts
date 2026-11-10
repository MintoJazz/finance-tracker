import assert from "node:assert/strict"
import { describe, it } from "node:test"
import type { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils"
import type { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface"
import { failure, success } from "@/types/result.types"
import type { IOperationPlanExecutor } from "../interfaces/operation-plan-executor.interface"
import { resolveEntityRef } from "../plan/compiler"
import type {
  OperationExecutionPlan,
  OperationExecutionResult,
  ResolvedNodeOutput,
} from "../plan/types"
import { ExecuteOperationUseCase } from "./execute-operation.use-case"

const MOCK_SESSION: SessionPayload = {
  partyId: 1,
  contextId: 10,
}

class InMemoryOperationPlanExecutor implements IOperationPlanExecutor {
  public lastPlan: OperationExecutionPlan | null = null
  private nextId = 500

  async execute(
    _contextId: number,
    plan: OperationExecutionPlan
  ): Promise<OperationExecutionResult> {
    this.lastPlan = plan
    const resolvedNodes: Record<string, ResolvedNodeOutput> = {}

    for (const node of plan.nodes) {
      resolvedNodes[node.id] = { id: this.nextId++ }
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
  }
}

describe("ExecuteOperationUseCase", () => {
  it("nega execução quando usuário não possui permissão canManageBalances", async () => {
    const spaceAccess: ISpaceAccessProvider = {
      execute: async () =>
        success({ canViewBalances: true, canManageBalances: false }),
    }
    const executor = new InMemoryOperationPlanExecutor()
    const useCase = new ExecuteOperationUseCase(spaceAccess, executor)

    const result = await useCase.execute({
      session: MOCK_SESSION,
      payload: {
        nature: "PAY",
        intents: [],
        base: {
          custodyBalanceId: 1,
          custodyType: "WALLET",
          amount: 5000,
          dueDate: "2026-11-10",
          description: "Almoço",
          categoryId: 101,
        },
      },
    })

    assert.equal(result.success, false)
    assert.equal(executor.lastPlan, null)
  })

  it("compila e executa o DAG completo (CREATE_CATEGORY + CREATE_SUBCATEGORY + Entry) resolvendo os IDs gerados", async () => {
    const spaceAccess: ISpaceAccessProvider = {
      execute: async () =>
        success({ canViewBalances: true, canManageBalances: true }),
    }
    const executor = new InMemoryOperationPlanExecutor()
    const useCase = new ExecuteOperationUseCase(spaceAccess, executor)

    const result = await useCase.execute({
      session: MOCK_SESSION,
      payload: {
        nature: "PAY",
        intents: ["CREATE_CATEGORY", "CREATE_SUBCATEGORY"],
        base: {
          custodyBalanceId: 1,
          custodyType: "WALLET",
          amount: 15000,
          dueDate: "2026-11-10",
          description: "Jantar Especial",
        },
        CREATE_CATEGORY: {
          name: "Gastronomia",
          color: "#10B981",
          icon: "Utensils",
        },
        CREATE_SUBCATEGORY: {
          name: "Restaurantes",
          color: "#10B981",
          icon: "Utensils",
        },
      },
    })

    assert.equal(result.success, true)
    if (result.success) {
      assert.equal(result.data.resolved.custodyBalanceId, 1)
      assert.equal(result.data.resolved.categoryRootId, 500)
      assert.equal(result.data.resolved.counterpartBalanceId, 501)
      assert.equal(result.data.resolved.mainEntryId, 502)
    }
  })

  it("rejeita payload inválido antes de chamar o executor", async () => {
    const spaceAccess: ISpaceAccessProvider = {
      execute: async () =>
        success({ canViewBalances: true, canManageBalances: true }),
    }
    const executor = new InMemoryOperationPlanExecutor()
    const useCase = new ExecuteOperationUseCase(spaceAccess, executor)

    const result = await useCase.execute({
      session: MOCK_SESSION,
      payload: {
        nature: "RECEIVE",
        intents: [],
        base: {
          custodyBalanceId: 1,
          custodyType: "CREDIT", // Inválido em RECEIVE
          amount: 5000,
          dueDate: "2026-11-10",
          description: "Teste",
          categoryId: 101,
        },
      },
    })

    assert.equal(result.success, false)
    assert.equal(executor.lastPlan, null)
  })
})
