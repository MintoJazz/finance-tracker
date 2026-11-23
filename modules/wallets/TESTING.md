# Testes do módulo `wallets`

Casos de teste no formato IEEE 829 (resumido), ligados aos testes automatizados.
Executar: `npx tsx --test "modules/wallets/**/*.spec.ts"`.

**Regra de produto:** carteiras **podem ter saldo negativo** (sistema de controle de finanças). Nenhum teste exige bloqueio de saldo.
**Pré-condição comum:** sessão com `contextId = 100`; provedor de acesso do espaço configurado conforme o caso.

## Casos de aplicação (use-cases)

| ID | Caso | Entrada / pré-condição | Resultado esperado | Técnica | Teste automatizado |
| --- | --- | --- | --- | --- | --- |
| CT-WAL-001 | Criar carteira válida | `canManageBalances`; nome válido | Carteira criada no contexto da sessão | CP | `create-wallet.use-case.spec.ts` › cria a carteira no contexto da sessão |
| CT-WAL-002 | Criar sem permissão de gerência | Só `canViewBalances` | Falha de permissão; repositório não é chamado | CP | `create-wallet.use-case.spec.ts` › nega quem só pode visualizar saldos |
| CT-WAL-003 | Acesso ao espaço falha | Provedor devolve erro | Erro propagado | CB | specs de create, update, archive e restore |
| CT-WAL-004 | Editar carteira ativa | Carteira ativa no contexto | Atualiza e devolve `{ id, name }` | CP | `update-wallet.use-case.spec.ts` |
| CT-WAL-005 | Editar carteira arquivada | `isArchived = true` | Falha "Não é possível editar uma carteira arquivada." | CP / CB | `update-wallet.use-case.spec.ts` |
| CT-WAL-006 | Arquivar e restaurar | Ativa arquiva; arquivada restaura | Sucesso; repetir a operação falha ("já está arquivada" / "não está arquivada") | EP | `archive-wallet…`, `restore-wallet.use-case.spec.ts` |
| CT-WAL-007 | Carteira inexistente ou de outro contexto | Repositório devolve `null` | Falha "Carteira não encontrada." | EP | specs de update, archive, restore e `get-wallets.use-cases.spec.ts` |
| CT-WAL-008 | Consultas (listagem, por id, perfil) | `canViewBalances` | Delegam à consulta com `contextId`, paginação e filtro | CP | `get-wallets.use-cases.spec.ts` |
| CT-WAL-009 | Falha de infraestrutura | Repositório lança exceção | Mensagem genérica "erro interno" | CB | todos os specs de use-case |

## Casos de validação (schemas)

| ID | Campo | Valores | Resultado esperado | Técnica | Teste automatizado |
| --- | --- | --- | --- | --- | --- |
| CT-WAL-020 | `name` | vazio; só espaços; 1; 50; 51 caracteres | Rejeita, rejeita, aceita, aceita, rejeita; remove espaços das pontas | EP + BVA | `models/wallet.schema.spec.ts` |
| CT-WAL-021 | `name` ausente ou numérico | `{}`; `{ name: 10 }` | Rejeita | EP | `models/wallet.schema.spec.ts` |
| CT-WAL-022 | `id` das ações | `1`; `0`; `-3`; `1.5`; ausente | Aceita só inteiro positivo | EP + BVA | `models/wallet.schema.spec.ts` › Archive / Restore / Update |

## Testes já existentes (anteriores a esta etapa)

- `infra/repositories/wallet-prisma.queries.spec.ts` (**depende de Postgres**: agregação de saldo no banco).
