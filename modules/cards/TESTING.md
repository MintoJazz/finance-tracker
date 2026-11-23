# Testes do módulo `cards`

Casos de teste no formato IEEE 829 (resumido), ligados aos testes automatizados.
Executar: `npx tsx --test "modules/cards/**/*.spec.ts"`.

**Legenda de técnica:** EP = partição de equivalência, BVA = análise de valor limite, CP = caixa-preta funcional, CB = caixa-branca (ramos).
**Pré-condição comum dos casos de aplicação:** sessão com `contextId = 100` e o provedor de acesso do espaço configurado conforme o caso.

## Casos de aplicação (use-cases)

| ID | Caso | Entrada / pré-condição | Resultado esperado | Técnica | Teste automatizado |
| --- | --- | --- | --- | --- | --- |
| CT-CRD-001 | Criar cartão válido | Usuário com `canManageBalances`; nome, limite e dias válidos | Cartão criado no contexto da sessão; resultado de sucesso | CP | `create-card.use-case.spec.ts` › cria o cartão no contexto da sessão |
| CT-CRD-002 | Criar cartão sem permissão de gerência | Usuário só com `canViewBalances` | Falha com mensagem de permissão; repositório não é chamado | CP | `create-card.use-case.spec.ts` › nega quem só pode visualizar saldos |
| CT-CRD-003 | Acesso ao espaço falha | Provedor de acesso devolve erro | Erro propagado sem tocar no repositório | CB | `create-card…`, `update-card…`, `archive-card…`, `restore-card…` › propaga a falha do provider |
| CT-CRD-004 | Editar cartão ativo | Cartão `id = 7` ativo no contexto | Atualiza e devolve `{ id, name }` | CP | `update-card.use-case.spec.ts` › atualiza um cartão ativo do contexto |
| CT-CRD-005 | Editar cartão arquivado | Cartão com `isArchived = true` | Falha "Não é possível editar um cartão arquivado."; nada é gravado | CP / CB | `update-card.use-case.spec.ts` › não permite editar cartão arquivado |
| CT-CRD-006 | Arquivar cartão ativo | Cartão ativo | Arquivado; consulta antes de arquivar | CP | `archive-card.use-case.spec.ts` › arquiva um cartão ativo do contexto |
| CT-CRD-007 | Arquivar duas vezes | Cartão já arquivado | Falha "Este cartão já está arquivado." | EP | `archive-card.use-case.spec.ts` › não arquiva duas vezes o mesmo cartão |
| CT-CRD-008 | Restaurar cartão arquivado / ativo | Arquivado: restaura. Ativo: falha "não está arquivado" | Conforme o estado | EP | `restore-card.use-case.spec.ts` |
| CT-CRD-009 | Cartão inexistente ou de outro contexto | `findByIdAndContextId` devolve `null` | Falha "Cartão não encontrado." | EP | `update-card…`, `archive-card…`, `restore-card…`, `get-cards.use-cases.spec.ts` |
| CT-CRD-010 | Consultas (listagem, por id, perfil) | Usuário com `canViewBalances` | Delegam à consulta com `contextId` da sessão, paginação e filtro | CP | `get-cards.use-cases.spec.ts` |
| CT-CRD-011 | Consultas sem permissão de visualização | `canViewBalances = false` | Falha de permissão; consulta não é chamada | CP | `get-cards.use-cases.spec.ts` › nega quem não pode visualizar saldos |
| CT-CRD-012 | Falha de infraestrutura | Repositório lança exceção | Mensagem genérica "erro interno", sem vazar a causa | CB | todos os specs de use-case › converte exceção em erro genérico |

## Casos de validação (schema `CardFormSchema`)

| ID | Campo | Partições / valores | Resultado esperado | Técnica | Teste automatizado |
| --- | --- | --- | --- | --- | --- |
| CT-CRD-020 | `name` | vazio e só espaços; `a`; 50 caracteres; 51 caracteres | Rejeita, aceita, aceita, rejeita; espaços das pontas removidos | EP + BVA | `models/card.schema.spec.ts` › name |
| CT-CRD-021 | `limit` (centavos) | `-1`; `0`; `1`; `10.5`; `"100"` | Rejeita o negativo, o decimal e o texto; aceita 0 e 1 | EP + BVA | `models/card.schema.spec.ts` › limit |
| CT-CRD-022 | `closingDay` e `dueDay` | `0`; `1`; `31`; `32`; `5.5`; `"5"` | Aceita só inteiros de 1 a 31 | EP + BVA | `models/card.schema.spec.ts` › closingDay / dueDay |
| CT-CRD-023 | `id` das ações | `1`; `0`; `-3`; `1.5`; ausente | Aceita só inteiro positivo; `UpdateCardSchema` exige o `id` | EP + BVA | `models/card.schema.spec.ts` › ArchiveCardSchema / UpdateCardSchema |

## Defeito conhecido que afeta o módulo

- **NC-03:** o `limit` aceita acima de 2.147.483.647 centavos (a coluna é `Int` de 32 bits). Ver `modules/operations/models/money-int32-bounds.spec.ts` (testes `todo`).

## Testes já existentes (anteriores a esta etapa)

- `infra/mappers/card.mapper.spec.ts`
