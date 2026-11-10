import assert from "node:assert/strict"
import test, { describe, it } from "node:test"
import { resolveSummaryCards } from "./resolver"
import { OPERATION_STEP_CATALOG } from "../intents/catalog"
import { MOCK_OPERATION_OPTIONS } from "../../infra/mock/operation-options.mock"
import type { OperationDraft } from "../../models/operation-input.schema"
import type { SummaryContext } from "./types"
import { OperationOptionsSchema } from "../../models/operation-options.schema"

describe("Operation Summary Core & Cumulative Cards Resolver", () => {
  it("valida que MOCK_OPERATION_OPTIONS satisfaz estritamente o OperationOptionsSchema", () => {
    const parsed = OperationOptionsSchema.safeParse(MOCK_OPERATION_OPTIONS)
    assert.ok(parsed.success)
  })

  it("garante que toda intenção do catálogo possui método plan definido (fonte única para DAG e Revisão)", () => {
    for (const [key, def] of Object.entries(OPERATION_STEP_CATALOG.intents)) {
      assert.equal(
        typeof def?.plan,
        "function",
        `Intenção "${key}" não possui método plan`
      )
    }
  })

  it("o resumo base possui uma única linha de categoria com disposição 'Categoria > Subcategoria'", () => {
    const payload: Partial<OperationDraft> = {
      nature: "PAY",
      base: {
        amount: 5000,
        categoryId: 101,
        subcategoryId: 1011,
        custodyBalanceId: 1,
        dueDate: "2026-11-06",
      },
    }

    const cards = resolveSummaryCards(
      {
        payload,
        activeIntents: [],
        lookups: MOCK_OPERATION_OPTIONS,
      },
      OPERATION_STEP_CATALOG
    )

    const baseCard = cards.find((c) => c.id === "summary.base")
    assert.ok(baseCard)

    // Deve ter apenas uma linha de categoria, e nenhuma linha separada de subcategoria
    const catRows = (baseCard.rows ?? []).filter((r) => r.id === "base_category")
    const subRows = (baseCard.rows ?? []).filter((r) => r.id === "base_subcategory")

    assert.equal(catRows.length, 1)
    assert.equal(subRows.length, 0)
    assert.deepEqual(catRows[0].value, {
      kind: "text",
      text: "Alimentação > Supermercado",
    })
  })

  it("quando a custódia for cartão de crédito, exibe 'Fatura Vigente (Automática)' no resumo", () => {
    const payload: Partial<OperationDraft> = {
      nature: "PAY",
      base: {
        amount: 15000,
        categoryId: 101,
        subcategoryId: 1011,
        custodyBalanceId: 2, // Nubank Ultravioleta (CREDIT)
        dueDate: "2026-11-10",
      },
    }

    const cards = resolveSummaryCards(
      {
        payload,
        activeIntents: [],
        lookups: MOCK_OPERATION_OPTIONS,
      },
      OPERATION_STEP_CATALOG
    )

    const baseCard = cards.find((c) => c.id === "summary.base")
    assert.ok(baseCard)

    const cycleRow = (baseCard.rows ?? []).find((r) => r.id === "base_cycle")
    assert.ok(cycleRow)
    assert.deepEqual(cycleRow.value, {
      kind: "text",
      text: "Fatura Vigente (Automática)",
    })
    assert.equal(cycleRow.stepId, "base.custody")
  })

  it("cards de criação de categoria e subcategoria geram visualItem com ícone, cor, título e subtítulo", () => {
    const payload: Partial<OperationDraft> = {
      nature: "PAY",
      base: {
        amount: 8000,
        categoryId: 101,
      },
      CREATE_CATEGORY: {
        name: "Lazer & Viagem",
        color: "#6366F1",
        icon: "Palmtree",
      },
      CREATE_SUBCATEGORY: {
        name: "Passagens Aéreas",
        color: "#6366F1",
        icon: "Plane",
      },
    }

    const cards = resolveSummaryCards(
      {
        payload,
        activeIntents: ["CREATE_CATEGORY", "CREATE_SUBCATEGORY"],
        lookups: MOCK_OPERATION_OPTIONS,
      },
      OPERATION_STEP_CATALOG
    )

    const catCard = cards.find((c) => c.id === "summary.intent.create_category")
    assert.ok(catCard)
    assert.ok(catCard.visualItem)
    assert.equal(catCard.visualItem.title, "Lazer & Viagem")
    assert.equal(catCard.visualItem.subtitle, "Categoria raiz")
    assert.equal(catCard.visualItem.icon, "Palmtree")
    assert.equal(catCard.visualItem.color, "#6366F1")
    assert.equal(catCard.visualItem.stepId, "intent.create_category.basics")

    const subCard = cards.find((c) => c.id === "summary.intent.create_subcategory")
    assert.ok(subCard)
    assert.ok(subCard.visualItem)
    assert.equal(subCard.visualItem.title, "Passagens Aéreas")
    assert.equal(subCard.visualItem.subtitle, "Subcategoria • Lazer & Viagem")
    assert.equal(subCard.visualItem.icon, "Plane")
    assert.equal(subCard.visualItem.color, "#6366F1")
    assert.equal(subCard.visualItem.stepId, "intent.create_subcategory.basics")

    // E no card base, a linha de categoria é combinada
    const baseCard = cards.find((c) => c.id === "summary.base")
    const catRow = baseCard?.rows?.find((r) => r.id === "base_category")
    assert.ok(catRow)
    assert.deepEqual(catRow.value, {
      kind: "text",
      text: "Lazer & Viagem > Passagens Aéreas",
    })
    assert.equal(catRow.stepId, "intent.create_category.basics")
  })

  it("compõe decorateBase de CREATE_SUBCATEGORY isoladamente usando a categoria base quando CREATE_CATEGORY não está ativa", () => {
    const payload: Partial<OperationDraft> = {
      nature: "PAY",
      base: {
        amount: 4500,
        categoryId: 101, // Alimentação
        custodyBalanceId: 1,
        dueDate: "2026-11-06",
      },
      CREATE_SUBCATEGORY: {
        name: "Cafeteria",
        color: "#F59E0B",
        icon: "Coffee",
      },
    }

    const cards = resolveSummaryCards(
      {
        payload,
        activeIntents: ["CREATE_SUBCATEGORY"],
        lookups: MOCK_OPERATION_OPTIONS,
      },
      OPERATION_STEP_CATALOG
    )

    const subCard = cards.find(
      (c) => c.id === "summary.intent.create_subcategory"
    )
    assert.ok(subCard?.visualItem)
    assert.equal(subCard.visualItem.title, "Cafeteria")
    assert.equal(subCard.visualItem.subtitle, "Subcategoria • Alimentação")

    const baseCard = cards.find((c) => c.id === "summary.base")
    const catRow = baseCard?.rows?.find((r) => r.id === "base_category")
    assert.ok(catRow)
    assert.deepEqual(catRow.value, {
      kind: "text",
      text: "Alimentação > Cafeteria",
    })
    assert.equal(catRow.stepId, "intent.create_subcategory.basics")
  })
})

