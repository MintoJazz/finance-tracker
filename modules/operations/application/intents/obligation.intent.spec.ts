import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { OPERATION_STEP_CATALOG } from "./catalog"
import { resolveSteps } from "../steps/interpreter"
import { compileOperationPlan } from "../plan/compiler"
import { resolveSummaryCards } from "../summary/resolver"

describe("Obligation Intents (SETTLE_PAYABLE & SETTLE_RECEIVABLE)", () => {
  it("está registrado no catálogo com schemas, slices e steps adequados", () => {
    const payDef = OPERATION_STEP_CATALOG.intents.SETTLE_PAYABLE
    const receiveDef = OPERATION_STEP_CATALOG.intents.SETTLE_RECEIVABLE

    assert.ok(payDef, "SETTLE_PAYABLE deve estar no catálogo")
    assert.ok(receiveDef, "SETTLE_RECEIVABLE deve estar no catálogo")

    assert.equal(payDef.key, "SETTLE_PAYABLE")
    assert.equal(receiveDef.key, "SETTLE_RECEIVABLE")

    assert.ok(payDef.removeSteps?.includes("base.amount"))
    assert.ok(payDef.removeSteps?.includes("base.category"))
    assert.ok(payDef.removeSteps?.includes("base.subcategory"))

    // Garante que base.details NÃO foi removido
    assert.equal(payDef.removeSteps?.includes("base.details"), false)
    assert.equal(receiveDef.removeSteps?.includes("base.details"), false)
  })

  it("oferece a intent apenas na etapa base.details respeitando a natureza", () => {
    const payDef = OPERATION_STEP_CATALOG.intents.SETTLE_PAYABLE
    const receiveDef = OPERATION_STEP_CATALOG.intents.SETTLE_RECEIVABLE

    assert.ok(payDef)
    assert.ok(receiveDef)

    assert.deepEqual(payDef.offer?.at, ["base.details"])
    assert.deepEqual(receiveDef.offer?.at, ["base.details"])

    assert.equal(payDef.offer?.when?.({ nature: "PAY" }, {} as any), true)
    assert.equal(payDef.offer?.when?.({ nature: "RECEIVE" }, {} as any), false)
    assert.equal(receiveDef.offer?.when?.({ nature: "RECEIVE" }, {} as any), true)
    assert.equal(receiveDef.offer?.when?.({ nature: "PAY" }, {} as any), false)
  })

  it("resolve os passos do fluxo de obrigação respeitando a ordem correta", () => {
    const steps = resolveSteps(
      {
        nature: "PAY",
        intents: ["SETTLE_PAYABLE"],
        seed: { nature: "PAY" },
      },
      OPERATION_STEP_CATALOG
    )

    const stepIds = steps.map((s) => s.id)
    assert.deepEqual(stepIds, [
      "base.details",
      "intent.settle_payable.contract",
      "intent.settle_payable.cycles",
      "base.custody",
      "base.review",
    ])
  })

  it("pula a etapa de contrato quando seed.agreementId é informado", () => {
    const steps = resolveSteps(
      {
        nature: "PAY",
        intents: ["SETTLE_PAYABLE"],
        seed: { nature: "PAY", agreementId: 42 },
      },
      OPERATION_STEP_CATALOG
    )

    const stepIds = steps.map((s) => s.id)
    assert.equal(stepIds.includes("intent.settle_payable.contract"), false)
    assert.deepEqual(stepIds, [
      "base.details",
      "intent.settle_payable.cycles",
      "base.custody",
      "base.review",
    ])
  })

  it("compila DAG com nó SETTLE_OBLIGATION e suprime criação direta de lançamento", () => {
    const plan = compileOperationPlan(
      {
        nature: "PAY",
        intents: ["SETTLE_PAYABLE"],
        base: {
          custodyBalanceId: 10,
          custodyType: "WALLET",
          amount: 50000,
          dueDate: "2026-11-10",
          description: "Quitação de aluguel",
        },
        SETTLE_PAYABLE: {
          agreementId: 42,
          allocations: [
            { referenceDate: "2026-10-01", amount: 25000, status: "OPEN" },
            { referenceDate: "2026-11-01", amount: 25000, status: "OPEN" },
          ],
        },
      },
      OPERATION_STEP_CATALOG
    )

    assert.equal(plan.nodes.length, 1)
    const node = plan.nodes[0]
    assert.equal(node.id, "intent.settle_payable")
    assert.equal(node.action.type, "SETTLE_OBLIGATION")

    if (node.action.type === "SETTLE_OBLIGATION") {
      assert.equal(node.action.nature, "PAY")
      assert.equal(node.action.agreementId, 42)
      assert.equal(node.action.allocations.length, 2)
    }

    // Garante que não foi criado base.direct_entry
    assert.equal(plan.nodes.some((n) => n.id === "base.direct_entry"), false)
  })

  it("resolve o resumo geral (fluxo base) e o card específico para SETTLE_OBLIGATION", () => {
    const cards = resolveSummaryCards(
      {
        payload: {
          nature: "PAY",
          intents: ["SETTLE_PAYABLE"],
          base: {
            custodyBalanceId: 10,
            custodyType: "WALLET",
            amount: 75000,
            dueDate: "2026-11-10",
            description: "Pagamento de fatura",
          },
          SETTLE_PAYABLE: {
            agreementId: 42,
            allocations: [
              { referenceDate: "2026-09-01", amount: 25000, status: "OPEN" },
              { referenceDate: "2026-10-01", amount: 25000, status: "OPEN" },
              { referenceDate: "2026-11-01", amount: 25000, status: "OPEN" },
            ],
          },
        },
        activeIntents: ["SETTLE_PAYABLE"],
        lookups: {
          custodies: [
            {
              id: 10,
              name: "Carteira Física",
              type: "WALLET",
              subtitle: "Saldo disponível",
            },
          ],
          categories: [],
          subcategories: [],
        },
      },
      OPERATION_STEP_CATALOG
    )

    // Padrão do projeto: 1 resumo geral (fluxo base) + 1 card para a intent ativa
    assert.equal(cards.length, 2)

    // 1. Card Base (Resumo Geral)
    const baseCard = cards.find((c) => c.id === "summary.base")
    assert.ok(baseCard)
    assert.equal(baseCard.title, "Lançamento Financeiro")
    assert.equal(baseCard.badge?.tone, "danger")
    const baseAmountRow = baseCard.rows?.find((r) => r.id === "base_amount")
    assert.deepEqual(baseAmountRow?.value, { kind: "money", cents: 75000 })
    assert.equal(baseAmountRow?.stepId, "intent.settle_payable.cycles")

    // 2. Card da Intent (Obrigação)
    const obligationCard = cards.find(
      (c) => c.id === "summary.intent.settle_payable"
    )
    assert.ok(obligationCard)
    assert.equal(obligationCard.title, "Pagamento de Compromisso")
    assert.equal(obligationCard.badge?.tone, "danger")

    assert.ok(obligationCard.rows)
    const cyclesRow = obligationCard.rows.find((r) => r.id === "obligation_cycles")
    assert.ok(cyclesRow)
    if (cyclesRow?.value?.kind === "text") {
      assert.ok(cyclesRow.value.text.includes("3 ciclos"))
    }

    const totalFooter = obligationCard.footer?.find(
      (f) => f.id === "obligation_total"
    )
    assert.ok(totalFooter)
    if (totalFooter?.value?.kind === "money") {
      assert.equal(totalFooter.value.cents, 75000)
    }
  })
})
