# Testes do módulo `movements`

Casos de teste no formato IEEE 829 (resumido), ligados aos testes automatizados.
Executar: `npx tsx --test "modules/movements/**/*.spec.ts"`.

**Pré-condição comum dos use-cases:** sessão com `contextId = 100`; consultas e provedores de acesso e de busca de saldo configurados conforme o caso.

## Casos de aplicação (use-cases)

| ID | Caso | Entrada / pré-condição | Resultado esperado | Técnica | Teste automatizado |
| --- | --- | --- | --- | --- | --- |
| CT-MOV-001 | Listar lançamentos da carteira | `canViewBalances`; carteira existe no contexto | Busca a carteira (`id`, `contextId`) e depois lista; devolve a página | CP | `application/use-cases/get-wallet-movements.use-case.spec.ts` › lista as movimentações da carteira |
| CT-MOV-002 | Listar lançamentos do cartão | `canViewBalances`; cartão existe | Lista com escopo `CARD` | CP | `get-card-movements.use-case.spec.ts` › lista os lançamentos do cartão |
| CT-MOV-003 | Carteira ou cartão inexistente no contexto | Busca devolve `null` | "Carteira não encontrada." / "Cartão não encontrado."; lista não é consultada | EP | ambos os specs › falha quando … não existe |
| CT-MOV-004 | Busca de cartão indisponível | Provedor sem `findCardById` | Tratado como "Cartão não encontrado." | CB | `get-card-movements.use-case.spec.ts` › trata a ausência do lookup |
| CT-MOV-005 | Sem permissão de visualização | `canViewBalances = false` | Mensagem de permissão; nenhuma consulta | CP | ambos os specs › nega quem não pode visualizar saldos |
| CT-MOV-006 | Erro de acesso ou acesso sem dados | Provedor falha ou devolve sucesso sem `data` | Erro propagado / "Falha ao validar acesso ao contexto." | CB | ambos os specs |
| CT-MOV-007 | Falha de infraestrutura | Consulta lança exceção | "erro interno" genérico | CB | ambos os specs |

## Tabela contábil de tipos (domínio)

`MovementEntryTypeResolver` traduz (escopo, tipo de lançamento, direção) em tipo de movimentação, sem `if`/`switch`.

| ID | Caso | Entrada | Resultado esperado | Técnica | Teste automatizado |
| --- | --- | --- | --- | --- | --- |
| CT-MOV-010 | Cobertura da tabela | Todos os `EntryType` nos escopos `CARD` e `WALLET` | Nenhum tipo fica sem mapeamento | CB | `infra/registries/movement-type-resolvers.spec.ts` › o registry cobre todos os EntryType |
| CT-MOV-011 | Cartão: dívida vira compra | `DIRECT`, `ACCRUAL`, `CLAIM_OPENING` com crédito ou débito | Sempre `PURCHASE` | EP | idem › no cartão, lançamentos de dívida viram PURCHASE |
| CT-MOV-012 | Carteira: depende da direção | Os mesmos tipos | `CREDIT` → `INCOME`; `DEBIT` → `EXPENSE` | EP | idem › na carteira … dependem da direção |
| CT-MOV-013 | Liquidações e demais tipos | `SETTLEMENT`, `CLAIM_PAYMENT`, `CLAIM_RECEIPT`; `TRANSFER`, `ADJUSTMENT`, `REVERSAL` | `SETTLEMENT`; os demais mantêm o tipo | EP | idem |
| CT-MOV-014 | Regras por tipo de carteira | `getRule` de cada tipo | `INCOME` = crédito, `EXPENSE` = débito, `TRANSFER` sem direção; só `EntryType` válidos | CP | idem › WalletMovementTypeResolver |

## Casos de validação (schemas)

| ID | Campo | Valores | Resultado esperado | Técnica | Teste automatizado |
| --- | --- | --- | --- | --- | --- |
| CT-MOV-020 | `amount` do lançamento | `0`; `-1`; `1.5` | `0` aceito; `-1` e decimal rejeitados | EP + BVA | `models/movement.schemas.spec.ts` › MovementEntrySchema |
| CT-MOV-021 | Flags e contraparte | Sem `isReversed`/`hasAttachment`; contraparte `NONE`, `BANK` | Defaults `false`; `NONE` aceita, `BANK` rejeitada | EP | idem |
| CT-MOV-022 | Paginação padrão | `{ balanceId: 5 }`; `{ page: 3 }`; `balanceId: 0`; `page: 0` | Padrão 1/10; página parcial completa o tamanho; ids/páginas inválidos rejeitados | EP + BVA | idem › GetBalanceMovementEntriesDTOSchema |
| CT-MOV-023 | Carteira: página como texto | `"2"`, `"25"`; `walletId = 0` | Convertidos para número; `walletId` inválido rejeitado | EP | idem › Schemas de carteira |
| CT-MOV-024 | Classificação por categoria | `category`, `multiple`, `pass-through`, `none`, `credit-settlement`, `unknown` | União discriminada por `kind` | EP | idem |

## Testes já existentes (anteriores a esta etapa)

- `infra/registries/movement-entry-type.registry.spec.ts`
- `infra/registries/movement-counterpart.registry.spec.ts`
- `infra/registries/movement-entry-filter-prisma.registry.spec.ts`
- `infra/registries/entry-category.view.spec.ts`
