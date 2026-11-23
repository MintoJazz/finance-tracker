# Testes do módulo `operations`

Casos de teste no formato IEEE 829 (resumido), ligados aos testes automatizados.
Executar: `npx tsx --test "modules/operations/**/*.spec.ts"`.

**Escopo atual:** a operação de pagamento de obrigações (`SETTLE_OBLIGATION`) está **desabilitada temporariamente** e fica para o próximo ciclo de implementações. Hoje o plano só tem as ações `CREATE_CATEGORY_BALANCE` e `CREATE_DIRECT_ENTRY`.
**Regra de produto:** carteiras podem ter saldo negativo; não há validação de saldo por decisão de produto.

## Compilador do plano (grafo acíclico dirigido)

| ID | Caso | Entrada | Resultado esperado | Técnica | Teste automatizado |
| --- | --- | --- | --- | --- | --- |
| CT-OPR-001 | Cadeia Categoria → Subcategoria → Lançamento | Criar categoria e subcategoria na mesma operação | 3 nós ordenados topologicamente; a contrapartida do lançamento aponta simbolicamente para a subcategoria | CP + CB | `application/plan/compiler.spec.ts` e `compiler.dag-branches.spec.ts` (TC-BC-08) |
| CT-OPR-002 | Duplicidade de id | Dois nós `n1` | "ID de nó duplicado no plano de operação" | CB | `compiler.dag-branches.spec.ts` (TC-BC-01) |
| CT-OPR-003 | Referência a nó inexistente | Nó que depende de `n99` | "…referencia o nó inexistente…" | CB | idem (TC-BC-02) |
| CT-OPR-004 | Ciclo | A → B → C → A; ciclo isolado ao lado de nó válido | "Dependência circular detectada" | CB | idem (TC-BC-03, 03b) e `compiler.spec.ts` |
| CT-OPR-005 | Auto-referência | Nó que depende de si mesmo | Ignorada; `dependsOn = []` | CB | idem (TC-BC-04) |
| CT-OPR-006 | Ordem e desempate | `order` 5000, 1000, 1000 | Ordena por `order` e depois por id | CB | idem (TC-BC-05) |
| CT-OPR-007 | Cadeia e diamante | A → B → C com `order` invertido; dependência dupla | Produtor sempre antes do consumidor | CB | idem (TC-BC-06, 07) |
| CT-OPR-008 | Determinismo | Mesma entrada em ordem inversa | Mesma ordenação | CB | idem |
| CT-OPR-009 | Extração de dependências | Ações sem referência, com referências repetidas e em campos diferentes | Lista sem duplicatas | CB | idem › extractNodeDependencies |
| CT-OPR-010 | Resolução de referências | Nula, existente, nó executado, nó pendente, porta válida e inválida | Id correto ou erro específico | CB | idem › resolveEntityRef |
| CT-OPR-011 | Pagamento de fatura de cartão | `CHOOSE_CARD_INVOICE` | A competência da fatura é propagada ao lançamento | CP | `compiler.spec.ts` |

**Cobertura de ramos de `compiler.ts`:** 69,57% → **82,76%** (meta ≥ 80%), medida com `--experimental-test-coverage`.
**Complexidade ciclomática de `sortNodesTopologically`:** V(G) = **16** (ESLint, regra `complexity`).

## Validação do valor e da data da operação (`BaseOperationSliceSchema`)

| ID | Campo | Valores | Resultado esperado | Técnica | Teste automatizado |
| --- | --- | --- | --- | --- | --- |
| CT-OPR-020 | `amount` — partições | `10000`; `-5000`; `0`; `150.75`; `"cem reais"`; `null` | Aceita o primeiro; rejeita os demais com a mensagem de cada partição | EP | `models/operation-base.schema.spec.ts` |
| CT-OPR-021 | `amount` — fronteira inferior | `-1`, `0`, `1`, `2` | Rejeita, rejeita, aceita, aceita | BVA | idem |
| CT-OPR-022 | `description` | Só espaços; 120; 121 caracteres | Rejeita; aceita; rejeita; remove espaços das pontas | BVA | idem |
| CT-OPR-023 | `competanceDate` | `2026-10-25`, `null`, `25/10/2026` | Aceita; aceita; rejeita | EP | idem |
| CT-OPR-024 | **`dueDate` inválida** | `"banana"`; `"2026-02-31"` | Deveria rejeitar | EP | idem (`todo`) — **Defeito NC-04**: `"2026-02-31"` é gravado em silêncio como 03/03/2026 |
| CT-OPR-025 | Causa raiz do NC-04 | `new Date("2026-02-31T12:00:00.000Z")` | Resulta em 2026-03-03 | CB | idem (teste que passa) |
| CT-OPR-030 | **Limite de 32 bits** | `INT32_MAX − 1`, `INT32_MAX`, `INT32_MAX + 1`, R$ 25.000.000,00 | As duas primeiras aceitas; as duas últimas deveriam ser rejeitadas | BVA | `models/money-int32-bounds.spec.ts` (10 `todo`) — **Defeito NC-03**, em 5 campos (operação, limite do cartão, ajuste de valor, recorrência, parcelamento) |

## Testes já existentes (anteriores a esta etapa)

- `application/use-cases/execute-operation.use-case.spec.ts`
- `application/use-cases/get-operation-options.use-case.spec.ts`
- `application/steps/interpreter.spec.ts`
- `application/summary/summary.spec.ts`
