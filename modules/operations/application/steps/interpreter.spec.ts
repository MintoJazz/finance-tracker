import assert from "node:assert/strict"
import test, { describe, it } from "node:test"
import { BASE_STEPS } from "./base"
import {
  availableIntents,
  findClosestActiveStep,
  findStepIdForFieldPath,
  resolveSteps,
  sanitizeActiveIntents,
} from "./interpreter"
import { isValidStepOrder } from "./order"
import { OPERATION_STEP_CATALOG } from "../intents/catalog"
import {
  createOperationInputSchema,
  pruneInactiveOperationSlices,
  type OperationDraft,
} from "../../models/operation-input.schema"

describe("Operation Steps & Intents Declarative Interpreter (Clean Core)", () => {
  it("garante que todo step do catálogo possui order inteiro de 4 dígitos (1000–9999) e id único", () => {
    const allSteps = [
      ...OPERATION_STEP_CATALOG.base,
      ...Object.values(OPERATION_STEP_CATALOG.intents).flatMap(
        (def) => def?.addSteps ?? []
      ),
    ]

    const seenIds = new Set<string>()

    for (const step of allSteps) {
      assert.ok(
        isValidStepOrder(step.order),
        `Step "${step.id}" possui order inválido: ${step.order}`
      )
      assert.ok(
        !seenIds.has(step.id),
        `Step id duplicado detectado: "${step.id}"`
      )
      seenIds.add(step.id)
    }
  })

  it("pula base.entry (1000) via skipWhen quando seed.nature está definido", () => {
    const stepsWithoutSeed = resolveSteps(
      { nature: "PAY", intents: [] },
      OPERATION_STEP_CATALOG
    )
    assert.ok(stepsWithoutSeed.some((s) => s.id === "base.entry"))

    const stepsWithSeed = resolveSteps(
      {
        nature: "PAY",
        intents: [],
        seed: { nature: "PAY" },
      },
      OPERATION_STEP_CATALOG
    )
    assert.equal(
      stepsWithSeed.some((s) => s.id === "base.entry"),
      false
    )
  })

  it("mantém fluxo base linear sem etapa de fatura (fatura resolvida automaticamente pelo vencimento da compra)", () => {
    const stepsWallet = resolveSteps(
      {
        nature: "PAY",
        intents: [],
        data: {
          nature: "PAY",
          base: { custodyType: "WALLET" },
        },
      },
      OPERATION_STEP_CATALOG
    )
    assert.equal(
      stepsWallet.some((s) => s.id === "base.custody-cycle"),
      false
    )

    const stepsCredit = resolveSteps(
      {
        nature: "PAY",
        intents: [],
        data: {
          nature: "PAY",
          base: { custodyType: "CREDIT" },
        },
      },
      OPERATION_STEP_CATALOG
    )
    assert.equal(
      stepsCredit.some((s) => s.id === "base.custody-cycle"),
      false
    )
  })

  it("ao ativar CREATE_CATEGORY, ativa automaticamente CREATE_SUBCATEGORY via autoActivateWhen (sem filhas no DAG)", () => {
    // Passando apenas CREATE_CATEGORY, o interpreter detecta que pointers.categoryRoot é um nó novo sem filhas
    // e ativa CREATE_SUBCATEGORY automaticamente via autoActivateWhen
    const steps = resolveSteps(
      {
        nature: "PAY",
        intents: ["CREATE_CATEGORY"],
      },
      OPERATION_STEP_CATALOG
    )

    const stepIds = steps.map((s) => s.id)

    // Passos de categoria
    assert.ok(stepIds.includes("intent.create_category.basics"))
    assert.ok(stepIds.includes("intent.create_category.color"))
    assert.ok(stepIds.includes("intent.create_category.icon"))

    // Passos de subcategoria (auto-ativados declarativamente)
    assert.ok(stepIds.includes("intent.create_subcategory.basics"))
    assert.ok(stepIds.includes("intent.create_subcategory.color"))
    assert.ok(stepIds.includes("intent.create_subcategory.icon"))

    // base.category foi substituído por CREATE_CATEGORY e base.subcategory por CREATE_SUBCATEGORY
    assert.equal(stepIds.includes("base.category"), false)
    assert.equal(stepIds.includes("base.subcategory"), false)

    const catIconIdx = stepIds.indexOf("intent.create_category.icon")
    const subBasicsIdx = stepIds.indexOf("intent.create_subcategory.basics")
    assert.ok(catIconIdx < subBasicsIdx)
  })

  it("ao selecionar categoria existente sem subcategorias nos lookups, ativa CREATE_SUBCATEGORY automaticamente", () => {
    const mockLookups = {
      custodies: [],
      categories: [{ id: 999, name: "Categoria Sem Filhas" }],
      subcategories: [], // nenhuma subcategoria
    }

    const steps = resolveSteps(
      {
        nature: "PAY",
        intents: [],
        data: {
          base: { categoryId: 999 },
        },
        lookups: mockLookups,
      },
      OPERATION_STEP_CATALOG
    )

    const stepIds = steps.map((s) => s.id)
    assert.ok(stepIds.includes("intent.create_subcategory.basics"))
    assert.equal(stepIds.includes("base.subcategory"), false)
  })

  it("ao selecionar categoria existente COM subcategorias nos lookups, mantém base.subcategory e NÃO auto-ativa CREATE_SUBCATEGORY", () => {
    const mockLookups = {
      custodies: [],
      categories: [{ id: 101, name: "Alimentação" }],
      subcategories: [
        { id: 1001, parentId: 101, parentName: "Alimentação", name: "Mercado" },
      ],
    }

    const steps = resolveSteps(
      {
        nature: "PAY",
        intents: [],
        data: {
          base: { categoryId: 101 },
        },
        lookups: mockLookups,
      },
      OPERATION_STEP_CATALOG
    )

    const stepIds = steps.map((s) => s.id)
    assert.ok(stepIds.includes("base.subcategory"))
    assert.equal(stepIds.includes("intent.create_subcategory.basics"), false)
  })

  it("poda fatias de intenções inativas mas preserva dados ativos no pruneInactiveOperationSlices", () => {
    const activeSteps = resolveSteps(
      { nature: "PAY", intents: ["CREATE_CATEGORY"] },
      OPERATION_STEP_CATALOG
    )

    const draft = {
      nature: "PAY" as const,
      intents: ["CREATE_CATEGORY" as const],
      base: {
        amount: 5000,
        description: "Compras",
      },
      CREATE_CATEGORY: {
        name: "Casa Nova",
        color: "#6366F1",
      },
      OTHER_UNKNOWN: {
        something: true,
      },
    }

    const pruned = pruneInactiveOperationSlices(
      draft,
      activeSteps,
      ["CREATE_CATEGORY", "CREATE_SUBCATEGORY"]
    )

    assert.equal(pruned.base?.amount, 5000)
    assert.equal(pruned.base?.description, "Compras")
    assert.equal(pruned.CREATE_CATEGORY?.name, "Casa Nova")
    assert.equal((pruned as any).OTHER_UNKNOWN, undefined)
  })

  it("mantém a posição no fluxo ao substituir base.category por CREATE_CATEGORY (findClosestActiveStep)", () => {
    const baseSteps = resolveSteps(
      { nature: "PAY", intents: [] },
      OPERATION_STEP_CATALOG
    )
    const withCategoryIntentSteps = resolveSteps(
      { nature: "PAY", intents: ["CREATE_CATEGORY"] },
      OPERATION_STEP_CATALOG
    )

    const closest = findClosestActiveStep(
      "base.category",
      withCategoryIntentSteps,
      OPERATION_STEP_CATALOG
    )
    assert.equal(closest?.id, "intent.create_category.basics")

    assert.equal(
      findStepIdForFieldPath("base.amount", baseSteps),
      "base.amount"
    )
    assert.equal(
      findStepIdForFieldPath("base.description", baseSteps),
      "base.details"
    )
  })

  it("garante a ordem exata do fluxo base: natureza -> descrição e data -> meio de pagamento -> valor -> categorias -> revisão", () => {
    // 1. Sem categoria selecionada, subcategoria fica oculta via condition (when)
    const baseStepsInitial = resolveSteps(
      { nature: "PAY", intents: [] },
      OPERATION_STEP_CATALOG
    )
    assert.deepEqual(
      baseStepsInitial.map((s) => s.id),
      [
        "base.entry",
        "base.details",
        "base.custody",
        "base.amount",
        "base.category",
        "base.review",
      ]
    )

    // 2. Com categoria selecionada e lookups com subcategorias, subcategoria aparece entre categoria e revisão
    const mockLookups = {
      custodies: [],
      categories: [{ id: 101, name: "Alimentação" }],
      subcategories: [
        { id: 1001, parentId: 101, parentName: "Alimentação", name: "Mercado" },
      ],
    }

    const baseStepsWithCategory = resolveSteps(
      {
        nature: "PAY",
        intents: [],
        data: {
          base: { categoryId: 101 },
        },
        lookups: mockLookups,
      },
      OPERATION_STEP_CATALOG
    )
    assert.deepEqual(
      baseStepsWithCategory.map((s) => s.id),
      [
        "base.entry",
        "base.details",
        "base.custody",
        "base.amount",
        "base.category",
        "base.subcategory",
        "base.review",
      ]
    )
  })

  it("executa step.validate declarativamente apenas para as etapas ativas no createOperationInputSchema", () => {
    const schema = createOperationInputSchema(OPERATION_STEP_CATALOG)

    // 1. Sem CREATE_CATEGORY, base.category está ativa e exige base.categoryId
    const missingCategoryResult = schema.safeParse({
      nature: "PAY",
      intents: [],
      base: {
        custodyBalanceId: 1,
        custodyType: "WALLET",
        amount: 5000,
        dueDate: "2026-11-10",
        description: "Mercado",
        categoryId: null,
      },
    })
    assert.equal(missingCategoryResult.success, false)

    // 2. Com CREATE_CATEGORY ativa, base.category é removida e base.categoryId não é exigido
    const withCreateCategoryResult = schema.safeParse({
      nature: "PAY",
      intents: ["CREATE_CATEGORY", "CREATE_SUBCATEGORY"],
      base: {
        custodyBalanceId: 1,
        custodyType: "WALLET",
        amount: 5000,
        dueDate: "2026-11-10",
        description: "Mercado",
        categoryId: null,
      },
      CREATE_CATEGORY: {
        name: "Alimentação",
      },
      CREATE_SUBCATEGORY: {
        name: "Supermercado",
      },
    })
    assert.equal(withCreateCategoryResult.success, true)

    // 3. Em RECEIVE, base.custody bloqueia custodyType === CREDIT via step.validate
    const receiveCreditResult = schema.safeParse({
      nature: "RECEIVE",
      intents: [],
      base: {
        custodyBalanceId: 1,
        custodyType: "CREDIT",
        amount: 5000,
        dueDate: "2026-11-10",
        description: "Reembolso",
        categoryId: 101,
      },
    })
    assert.equal(receiveCreditResult.success, false)
  })

  it("declara initialSlice em todas as intenções do catálogo sem acoplamento externo", () => {
    for (const [key, def] of Object.entries(OPERATION_STEP_CATALOG.intents)) {
      assert.ok(
        typeof def?.initialSlice === "function",
        `Intenção "${key}" deve declarar initialSlice`
      )
      const slice = def.initialSlice({ seed: {} })
      assert.ok(
        slice && typeof slice === "object",
        `initialSlice de "${key}" deve retornar um objeto`
      )
    }
  })

  it("habilita CHOOSE_CARD_INVOICE para custódia CREDIT, posiciona entre custódia e valor, e revoga ao mudar para WALLET", () => {
    const catalog = OPERATION_STEP_CATALOG
    assert.equal("CHOOSE_CARD_INVOICE" in catalog.intents, true)
    assert.ok(catalog.intents.CHOOSE_CARD_INVOICE)

    const steps = resolveSteps(
      {
        nature: "PAY",
        intents: ["CHOOSE_CARD_INVOICE"],
        data: {
          base: { custodyType: "CREDIT", custodyBalanceId: 2 },
        },
      },
      catalog
    )
    const stepIds = steps.map((s) => s.id)
    const custodyIdx = stepIds.indexOf("base.custody")
    const invoiceIdx = stepIds.indexOf("intent.choose_card_invoice")
    const amountIdx = stepIds.indexOf("base.amount")

    assert.ok(custodyIdx !== -1 && invoiceIdx !== -1 && amountIdx !== -1)
    assert.ok(
      custodyIdx < invoiceIdx && invoiceIdx < amountIdx,
      "intent.choose_card_invoice deve ficar ordenado exatamente entre base.custody e base.amount"
    )

    const schema = createOperationInputSchema(catalog)
    const validResult = schema.safeParse({
      nature: "PAY",
      intents: ["CHOOSE_CARD_INVOICE"],
      base: {
        custodyBalanceId: 2,
        custodyType: "CREDIT",
        amount: 12000,
        dueDate: "2026-11-10",
        description: "Assinatura de software",
        categoryId: 101,
      },
      CHOOSE_CARD_INVOICE: {
        from: "2026-11-04",
        to: "2026-12-03",
        dueDate: "2026-12-09",
        label: "Dezembro 2026",
      },
    })
    assert.equal(validResult.success, true)

    const invalidResult = schema.safeParse({
      nature: "PAY",
      intents: ["CHOOSE_CARD_INVOICE"],
      base: {
        custodyBalanceId: 2,
        custodyType: "CREDIT",
        amount: 12000,
        dueDate: "2026-11-10",
        description: "Assinatura de software",
        categoryId: 101,
      },
      CHOOSE_CARD_INVOICE: {
        from: "",
        to: "",
        dueDate: "",
        label: "",
      },
    })
    assert.equal(invalidResult.success, false)

    assert.deepEqual(
      sanitizeActiveIntents(["CHOOSE_CARD_INVOICE"], catalog, {
        base: { custodyType: "WALLET", custodyBalanceId: 1 },
      }),
      []
    )
  })
})
