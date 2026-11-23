import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  extractNodeDependencies,
  resolveEntityRef,
  sortNodesTopologically,
} from "./compiler"
import type {
  CreateCategoryBalanceAction,
  CreateDirectEntryAction,
  EntityRef,
  IntentPlanNodeInput,
  ResolvedNodeOutput,
} from "./types"

/**
 * Roteiro de cobertura de ramos de `sortNodesTopologically` (Milestone 2, Tabela 5),
 * implementado com as formas reais de nó do código atual.
 */

const category = (parent: EntityRef | null = null): CreateCategoryBalanceAction => ({
  type: "CREATE_CATEGORY_BALANCE",
  name: "Categoria",
  color: null,
  icon: null,
  parent,
})

const entry = (counterpart: EntityRef | null): CreateDirectEntryAction => ({
  type: "CREATE_DIRECT_ENTRY",
  nature: "PAY",
  custody: { kind: "existing", id: 3 },
  custodyType: "WALLET",
  counterpart,
  amountCents: 12_000,
  description: "Mensalidade",
  dueDate: "2026-11-20",
  competanceDate: null,
})

const node = (
  id: string,
  order: number,
  action: CreateCategoryBalanceAction | CreateDirectEntryAction = category()
): IntentPlanNodeInput<string> => ({ id, source: "BASE", order, action })

const ref = (nodeId: string, port?: string): EntityRef => ({ kind: "node", nodeId, ...(port ? { port } : {}) })
const ids = (nodes: readonly { id: string }[]) => nodes.map((n) => n.id)

describe("sortNodesTopologically — cenários de ramo (TC-BC)", () => {
  it("TC-BC-00: lista vazia devolve lista vazia", () => {
    assert.deepEqual(sortNodesTopologically([]), [])
  })

  it("TC-BC-01 (duplicidade): dois nós com o mesmo id lançam erro", () => {
    assert.throws(
      () => sortNodesTopologically([node("n1", 1000), node("n1", 2000)]),
      /ID de nó duplicado no plano de operação: "n1"/
    )
  })

  it("TC-BC-02 (referência inexistente): dependência de nó que não está no plano lança erro", () => {
    assert.throws(
      () => sortNodesTopologically([node("n1", 1000, category(ref("n99")))]),
      /O nó "n1" referencia o nó inexistente "n99" no plano de operação/
    )
  })

  it("TC-BC-03 (ciclo): ciclo de 3 nós é detectado (A -> B -> C -> A)", () => {
    assert.throws(
      () =>
        sortNodesTopologically([
          node("a", 1000, category(ref("c"))),
          node("b", 2000, category(ref("a"))),
          node("c", 3000, category(ref("b"))),
        ]),
      /Dependência circular detectada/
    )
  })

  it("TC-BC-03b (ciclo parcial): um ciclo isolado derruba o plano mesmo com nós válidos ao lado", () => {
    assert.throws(
      () =>
        sortNodesTopologically([
          node("ok", 1000),
          node("x", 2000, category(ref("y"))),
          node("y", 3000, category(ref("x"))),
        ]),
      /Dependência circular detectada/
    )
  })

  it("TC-BC-04 (auto-referência): dependência de si mesmo é ignorada", () => {
    const sorted = sortNodesTopologically([node("n1", 1000, category(ref("n1")))])
    assert.deepEqual(ids(sorted), ["n1"])
    assert.deepEqual(sorted[0].dependsOn, [])
  })

  it("TC-BC-05 (ordem e desempate): sem dependências, ordena por `order` e depois por id", () => {
    const sorted = sortNodesTopologically([node("n1", 5000), node("n3", 1000), node("n2", 1000)])
    assert.deepEqual(ids(sorted), ["n2", "n3", "n1"])
  })

  it("TC-BC-06 (cadeia): produtor sempre vem antes do consumidor, mesmo com `order` invertido", () => {
    const sorted = sortNodesTopologically([
      node("c", 1000, category(ref("b"))),
      node("b", 2000, category(ref("a"))),
      node("a", 9000),
    ])
    assert.deepEqual(ids(sorted), ["a", "b", "c"])
    assert.deepEqual(sorted[2].dependsOn, ["b"])
  })

  it("TC-BC-07 (diamante): nó com duas dependências só é liberado quando as duas terminam", () => {
    const sorted = sortNodesTopologically([
      node("root", 1000),
      node("left", 2000, category(ref("root"))),
      node("right", 3000, category(ref("root"))),
      node("join", 4000, entry(ref("left"))),
    ])
    const order = ids(sorted)
    assert.ok(order.indexOf("root") < order.indexOf("left"))
    assert.ok(order.indexOf("root") < order.indexOf("right"))
    assert.ok(order.indexOf("left") < order.indexOf("join"))
  })

  it("TC-BC-08 (cadeia do M2): Categoria -> Subcategoria -> Lançamento em 3 nós", () => {
    const sorted = sortNodesTopologically([
      node("base.direct_entry", 9000, entry(ref("intent.create_subcategory"))),
      node("intent.create_subcategory", 5200, category(ref("intent.create_category"))),
      node("intent.create_category", 5100),
    ])
    assert.deepEqual(ids(sorted), [
      "intent.create_category",
      "intent.create_subcategory",
      "base.direct_entry",
    ])
  })

  it("preserva os campos do nó e acrescenta `dependsOn` sem repetir dependências", () => {
    const sorted = sortNodesTopologically([
      node("a", 1000),
      node("b", 2000, entry(ref("a"))),
    ])
    assert.equal(sorted[1].source, "BASE")
    assert.equal(sorted[1].order, 2000)
    assert.deepEqual(sorted[1].dependsOn, ["a"])
  })

  it("é determinístico: a mesma entrada em ordens diferentes produz a mesma ordenação", () => {
    const input = [node("z", 1000), node("a", 1000), node("m", 500), node("k", 500, category(ref("z")))]
    const expected = ids(sortNodesTopologically(input))
    assert.deepEqual(ids(sortNodesTopologically([...input].reverse())), expected)
  })
})

describe("extractNodeDependencies", () => {
  it("ação sem referências a nós não tem dependências", () => {
    assert.deepEqual(extractNodeDependencies(category()), [])
    assert.deepEqual(extractNodeDependencies(entry({ kind: "existing", id: 5 })), [])
    assert.deepEqual(extractNodeDependencies(entry(null)), [])
  })

  it("coleta referências a nós, sem duplicar", () => {
    const action = { ...entry(ref("a")), custody: ref("a") }
    assert.deepEqual(extractNodeDependencies(action), ["a"])
  })

  it("coleta referências em campos diferentes", () => {
    const action = { ...entry(ref("b")), custody: ref("a") }
    assert.deepEqual(extractNodeDependencies(action).sort(), ["a", "b"])
  })

  it("ignora referências a entidades existentes e objetos que não são referência", () => {
    const action = { ...entry({ kind: "existing", id: 7 }), custody: { kind: "node" } as unknown as EntityRef }
    assert.deepEqual(extractNodeDependencies(action), [])
  })
})

describe("resolveEntityRef", () => {
  const resolved: Record<string, ResolvedNodeOutput> = {
    cat: { id: 101 } as ResolvedNodeOutput,
    multi: { id: 1, ports: { receivable: 55, bad: "x" as unknown as number } } as ResolvedNodeOutput,
  }

  it("referência ausente resolve para null", () => {
    assert.equal(resolveEntityRef(null, resolved), null)
    assert.equal(resolveEntityRef(undefined, resolved), null)
  })

  it("entidade existente devolve o próprio id", () => {
    assert.equal(resolveEntityRef({ kind: "existing", id: 9 }, resolved), 9)
  })

  it("nó já executado devolve o id gerado na persistência", () => {
    assert.equal(resolveEntityRef(ref("cat"), resolved), 101)
  })

  it("nó ainda não executado lança erro", () => {
    assert.throws(() => resolveEntityRef(ref("nada"), resolved), /nó ainda não executado/)
  })

  it("porta de saída produzida devolve o id da porta", () => {
    assert.equal(resolveEntityRef(ref("multi", "receivable"), resolved), 55)
  })

  it("porta inexistente ou não numérica lança erro", () => {
    assert.throws(() => resolveEntityRef(ref("multi", "payable"), resolved), /não produziu a porta de saída "payable"/)
    assert.throws(() => resolveEntityRef(ref("multi", "bad"), resolved), /não produziu a porta de saída "bad"/)
    assert.throws(() => resolveEntityRef(ref("cat", "qualquer"), resolved), /não produziu a porta/)
  })
})
