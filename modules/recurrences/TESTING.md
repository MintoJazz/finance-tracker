# Testes do módulo `recurrences`

Casos de teste no formato IEEE 829 (resumido), ligados aos testes automatizados.
Executar: `npx tsx --test "modules/recurrences/**/*.spec.ts"`.

**Pré-condição comum:** sessão com `contextId = 100`; uma recorrência tem estados independentes **ativa/desativada** e **arquivada/restaurada**.

## Casos de aplicação (use-cases de estado)

| ID | Caso | Entrada / pré-condição | Resultado esperado | Técnica | Teste automatizado |
| --- | --- | --- | --- | --- | --- |
| CT-REC-001 | Arquivar recorrência ativa | `canManageBalances`; recorrência não arquivada | Arquiva depois de consultar | CP | `application/use-cases/recurrence-state.use-cases.spec.ts` › ArchiveRecurrenceUseCase |
| CT-REC-002 | Arquivar inexistente ou já arquivada | `null` / `isArchived = true` | "Recorrência não encontrada." / "Esta recorrência já está arquivada."; nada é arquivado | EP | idem |
| CT-REC-003 | Restaurar recorrência arquivada | Arquivada / não arquivada | Restaura / "Esta recorrência não está arquivada." | EP | idem › RestoreRecurrenceUseCase |
| CT-REC-004 | Ativar e desativar | Estado atual diferente do pedido | Altera e devolve o novo estado | CP | idem › SetRecurrenceActiveUseCase |
| CT-REC-005 | Estado já igual ao pedido | Ativar uma ativa; desativar uma desativada | "já está ativa" / "já está desativada" | EP | idem |
| CT-REC-006 | Alterar recorrência arquivada | Arquivada | "Não é possível alterar uma recorrência arquivada." | CP | idem |
| CT-REC-007 | Sem permissão, acesso negado, exceção | `canManageBalances = false`; erro de acesso; falha do banco | Mensagem de permissão; erro propagado; "erro interno" | CB | idem |
| CT-REC-008 | Opções do formulário | `canViewBalances` | Categorias e subcategorias ativas do contexto | CP | idem › GetRecurrenceFormOptionsUseCase |
| CT-REC-009 | Opções sem permissão ou com falha | Erro de acesso; sem visualização; exceção | Erro propagado; mensagem de permissão; "erro interno" | CB | idem |

## Casos de validação (schemas)

| ID | Schema | Valores | Resultado esperado | Técnica | Teste automatizado |
| --- | --- | --- | --- | --- | --- |
| CT-REC-020 | `ArchiveRecurrenceSchema`, `RestoreRecurrenceSchema` | `id` = `1`; `0`; `-1`; `1.5`; `"1"`; ausente | Aceita só inteiro positivo | EP + BVA | `models/schemas/recurrence-state.schemas.spec.ts` |
| CT-REC-021 | `SetRecurrenceActiveSchema` | `isActive` booleano, `"true"`, ausente | Só booleano | EP | idem |
| CT-REC-022 | `RecurrenceCycleFiltersSchema` | Vazio; `offset` `"2"`, `"-1"`, `1.5`; status válidos e `OPEN`; datas `YYYY-MM-DD` e `01/01/2026` | Padrões `offset = 0`, `ALL`, projetados incluídos; converte texto; rejeita decimal, status e formato inválidos | EP | idem |

## Defeito conhecido que afeta o módulo

- **NC-03:** o valor da recorrência (`amount`) aceita acima de 2.147.483.647 centavos. Ver `modules/operations/models/money-int32-bounds.spec.ts`.

## Testes já existentes (anteriores a esta etapa)

- `application/use-cases/create-recurrence.use-case.spec.ts`
- `application/use-cases/update-recurrence.use-case.spec.ts`
- `application/use-cases/get-context-recurrences.use-case.spec.ts`
- `application/use-cases/get-recurrence-profile.use-case.spec.ts`
- `application/use-cases/get-recurrence-cycles.use-case.spec.ts`
- `application/services/recurrence-schedule.calculator.spec.ts`
- `models/schemas/recurrence-form.schema.spec.ts`
- `infra/mappers/recurrence-write.mapper.spec.ts`
- `infra/repositories/recurrence-prisma.queries.spec.ts`
