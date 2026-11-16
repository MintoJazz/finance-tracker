import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { OPERATION_STEP_CATALOG } from "../intents/catalog"
import {
  compileOperationPlan,
  resolveEntityRef,
  sortNodesTopologically,
} from "./compiler"
import type { ResolvedNodeOutput } from "./types"

describe("Operation Plan Compiler (DAG & Symbolic Pointers)", () => {
  it("compila operação BASE simples com 1 nó CREATE_DIRECT_ENTRY apontando para existing(subcategoryId)", () => {
    const plan = compileOperationPlan(
      {
        nature: "PAY",
        intents: [],
        base: {
          custodyBalanceId: 1,
          custodyType: "WALLET",
          amount: 12000,
          dueDate: "2026-11-10",
          description: "Supermercado Semanal",
          categoryId: 101,
          subcategoryId: 1011,
        },
      },
      OPERATION_STEP_CATALOG
    )

    assert.equal(plan.nodes.length, 1)
    assert.equal(plan.nodes[0].id, "base.direct_entry")
    assert.deepEqual(plan.nodes[0].dependsOn, [])

    assert.deepEqual(plan.pointers.custody, { kind: "existing", id: 1 })
    assert.deepEqual(plan.pointers.categoryRoot, { kind: "existing", id: 101 })
    assert.deepEqual(plan.pointers.counterpart, { kind: "existing", id: 1011 })
    assert.deepEqual(plan.pointers.mainEntry, {
      kind: "node",
      nodeId: "base.direct_entry",
    })
  })

  it("compila CREATE_SUBCATEGORY conectando parent em existing(categoryId) e ordenando antes de base.direct_entry", () => {
    const plan = compileOperationPlan(
      {
        nature: "PAY",
        intents: ["CREATE_SUBCATEGORY"],
        base: {
          custodyBalanceId: 2,
          custodyType: "WALLET",
          amount: 4500,
          dueDate: "2026-11-10",
          description: "Expresso",
          categoryId: 101,
        },
        CREATE_SUBCATEGORY: {
          name: "Cafeteria",
          color: "#F59E0B",
          icon: "Coffee",
        },
      },
      OPERATION_STEP_CATALOG
    )

    assert.equal(plan.nodes.length, 2)
    assert.deepEqual(
      plan.nodes.map((n) => n.id),
      ["intent.create_subcategory", "base.direct_entry"]
    )

    const subNode = plan.nodes[0]
    assert.equal(subNode.action.type, "CREATE_CATEGORY_BALANCE")
    if (subNode.action.type === "CREATE_CATEGORY_BALANCE") {
      assert.deepEqual(subNode.action.parent, { kind: "existing", id: 101 })
    }
    assert.deepEqual(subNode.dependsOn, [])

    const entryNode = plan.nodes[1]
    assert.deepEqual(entryNode.dependsOn, ["intent.create_subcategory"])
  })

  it("compila CREATE_CATEGORY + CREATE_SUBCATEGORY em cadeia topológica de 3 nós (Categoria -> Subcategoria -> Entry)", () => {
    const plan = compileOperationPlan(
      {
        nature: "PAY",
        intents: ["CREATE_CATEGORY"], // expande CREATE_SUBCATEGORY via implies
        base: {
          custodyBalanceId: 1,
          custodyType: "WALLET",
          amount: 80000,
          dueDate: "2026-11-15",
          description: "Voo SP-RJ",
        },
        CREATE_CATEGORY: {
          name: "Viagens",
          color: "#6366F1",
          icon: "Palmtree",
        },
        CREATE_SUBCATEGORY: {
          name: "Passagens Aéreas",
          color: "#6366F1",
          icon: "Plane",
        },
      },
      OPERATION_STEP_CATALOG
    )

    assert.equal(plan.nodes.length, 3)
    // Mesmo que base.direct_entry tenha order 3000 e as categorias tenham 4010 e 4110,
    // a dependência de EntityRef força base.direct_entry a vir POR ÚLTIMO!
    assert.deepEqual(
      plan.nodes.map((n) => n.id),
      [
        "intent.create_category",
        "intent.create_subcategory",
        "base.direct_entry",
      ]
    )

    assert.deepEqual(plan.nodes[0].dependsOn, [])
    assert.deepEqual(plan.nodes[1].dependsOn, ["intent.create_category"])
    assert.deepEqual(plan.nodes[2].dependsOn, ["intent.create_subcategory"])

    // Testa resolução de EntityRefs simulando IDs gerados no banco
    const resolvedMap: Record<string, ResolvedNodeOutput> = {
      "intent.create_category": { id: 500 },
      "intent.create_subcategory": { id: 501 },
      "base.direct_entry": { id: 900 },
    }

    assert.equal(
      resolveEntityRef(plan.pointers.categoryRoot, resolvedMap),
      500
    )
    assert.equal(resolveEntityRef(plan.pointers.counterpart, resolvedMap), 501)
    assert.equal(resolveEntityRef(plan.pointers.mainEntry, resolvedMap), 900)
  })

  it("compila CHOOSE_CARD_INVOICE propagando slice.from como competanceDate no nó base.direct_entry", () => {
    const plan = compileOperationPlan(
      {
        nature: "PAY",
        intents: ["CHOOSE_CARD_INVOICE"],
        base: {
          custodyBalanceId: 2,
          custodyType: "CREDIT",
          amount: 25000,
          dueDate: "2026-11-15",
          description: "Compra antecipada na fatura seguinte",
          categoryId: 101,
        },
        CHOOSE_CARD_INVOICE: {
          from: "2026-12-04",
          to: "2027-01-03",
          dueDate: "2027-01-09",
          label: "Janeiro 2027",
        },
      },
      OPERATION_STEP_CATALOG
    )

    assert.equal(plan.nodes.length, 1)
    const entryNode = plan.nodes[0]
    assert.equal(entryNode.id, "base.direct_entry")
    assert.equal(entryNode.action.type, "CREATE_DIRECT_ENTRY")
    if (entryNode.action.type === "CREATE_DIRECT_ENTRY") {
      assert.equal(entryNode.action.competanceDate, "2026-12-04")
    }
  })

  it("detecta e rejeita ciclos no grafo (DAG inválido)", () => {
    assert.throws(
      () =>
        sortNodesTopologically([
          {
            id: "node.a",
            source: "BASE",
            order: 1000,
            action: {
              type: "CREATE_CATEGORY_BALANCE",
              name: "A",
              color: null,
              icon: null,
              parent: { kind: "node", nodeId: "node.b" },
            },
          },
          {
            id: "node.b",
            source: "BASE",
            order: 2000,
            action: {
              type: "CREATE_CATEGORY_BALANCE",
              name: "B",
              color: null,
              icon: null,
              parent: { kind: "node", nodeId: "node.a" },
            },
          },
        ]),
      /Dependência circular detectada/
    )
  })
})

