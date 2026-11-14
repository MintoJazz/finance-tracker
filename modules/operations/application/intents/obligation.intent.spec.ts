import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { createOperationInputSchema } from "../../models/operation-input.schema"
import { OPERATION_STEP_CATALOG } from "./catalog"

describe("Obligation Intents desabilitadas", () => {
  it("não estão registradas no catálogo ativo", () => {
    assert.equal("SETTLE_PAYABLE" in OPERATION_STEP_CATALOG.intents, false)
    assert.equal("SETTLE_RECEIVABLE" in OPERATION_STEP_CATALOG.intents, false)
    assert.equal(OPERATION_STEP_CATALOG.intents.SETTLE_PAYABLE, undefined)
    assert.equal(OPERATION_STEP_CATALOG.intents.SETTLE_RECEIVABLE, undefined)
  })

  it("são rejeitadas pelo schema de operação se vierem no payload", () => {
    const schema = createOperationInputSchema(OPERATION_STEP_CATALOG)

    const payResult = schema.safeParse({
      nature: "PAY",
      intents: ["SETTLE_PAYABLE"],
      base: {
        custodyBalanceId: 10,
        custodyType: "WALLET",
        amount: 50000,
        dueDate: "2026-11-10",
        description: "Quitação de aluguel",
        categoryId: 101,
      },
      SETTLE_PAYABLE: {
        agreementId: 42,
        allocations: [{ referenceDate: "2026-10-01", amount: 50000 }],
      },
    })

    const receiveResult = schema.safeParse({
      nature: "RECEIVE",
      intents: ["SETTLE_RECEIVABLE"],
      base: {
        custodyBalanceId: 10,
        custodyType: "WALLET",
        amount: 50000,
        dueDate: "2026-11-10",
        description: "Cobrança do aluguel",
        categoryId: 101,
      },
      SETTLE_RECEIVABLE: {
        agreementId: 42,
        allocations: [{ referenceDate: "2026-10-01", amount: 50000 }],
      },
    })

    assert.equal(payResult.success, false)
    assert.equal(receiveResult.success, false)
  })
})
