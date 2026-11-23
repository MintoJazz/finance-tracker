# Testes do módulo `space`

Casos de teste no formato IEEE 829 (resumido), ligados aos testes automatizados.
Executar: `npx tsx --test "modules/space/**/*.spec.ts"`.

O módulo decide **quem pode ver e quem pode gerenciar** os saldos de um contexto financeiro; todos os outros módulos dependem dele.

## Política de permissões (`SpacePolicy`)

| ID | Papel do membro | Visualizar saldos | Gerenciar saldos | Técnica | Teste automatizado |
| --- | --- | --- | --- | --- | --- |
| CT-SPC-001 | `OWNER` | sim | sim | EP | `application/use-cases/space.use-cases.spec.ts` › SpacePolicy |
| CT-SPC-002 | `ADMIN` | sim | sim | EP | idem |
| CT-SPC-003 | `MEMBER` | sim | **não** | EP | idem |
| CT-SPC-004 | `DEPENDENT` | **não** | **não** | EP | idem |

## Casos de aplicação (use-cases)

| ID | Caso | Entrada / pré-condição | Resultado esperado | Técnica | Teste automatizado |
| --- | --- | --- | --- | --- | --- |
| CT-SPC-010 | Obter acesso de um membro | Vínculo `(contextId, partyId)` existe | Devolve `canViewBalances` e `canManageBalances` conforme o papel | CP | `space.use-cases.spec.ts` › GetSpaceAccessUseCase |
| CT-SPC-011 | Sem vínculo com o contexto | Vínculo inexistente | "Sem permissão para acessar este contexto!" | EP | idem |
| CT-SPC-012 | Falha de infraestrutura | Repositório lança exceção | "erro interno" genérico | CB | idem |
| CT-SPC-013 | **Membro removido ou pendente** | Vínculo `REMOVED`/`PENDING` com papel `OWNER` | Deveria negar o acesso | EP | idem (`todo`) — **Defeito NC-01**: hoje o acesso é concedido |
| CT-SPC-020 | Trocar de contexto | Vínculo `ACTIVE` | Devolve o `contextId` pedido | CP | `space.use-cases.spec.ts` › SwitchContextUseCase |
| CT-SPC-021 | Trocar com ids inválidos | `partyId` ou `contextId` = `0`, negativo | "Parâmetros de contexto inválidos."; sem consulta ao banco | BVA | idem |
| CT-SPC-022 | Trocar com vínculo não ativo | `PENDING`, `REMOVED` ou inexistente | "Você não tem permissão para acessar este espaço financeiro." | EP | idem |
| CT-SPC-030 | Listar contextos do usuário | `partyId` válido | Contextos ativos; retorno nulo vira lista vazia | CP | `space.use-cases.spec.ts` › GetUserContextsUseCase |
| CT-SPC-031 | Listar com `partyId` inválido | `0`, `-1` | "Identificador de usuário inválido."; sem consulta | BVA | idem |

## Observação para a auditoria

`SwitchContextUseCase` exige vínculo `ACTIVE`, mas `GetSpaceAccessUseCase` ignora o `status`. As duas regras divergem (CT-SPC-013 versus CT-SPC-022), e o teste `todo` mantém o defeito reproduzível até a correção.
