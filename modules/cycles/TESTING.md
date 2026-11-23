# Testes do módulo `cycles`

Casos de teste no formato IEEE 829 (resumido), ligados aos testes automatizados.
Executar: `npx tsx --test "modules/cycles/**/*.spec.ts"`.

**Pré-condição comum:** datas locais (sem fuso) para os testes de motor; consultas e provedor de acesso falsos para os use-cases.

## Motor de janelas (`CycleWindowEngine`)

| ID | Caso | Entrada | Resultado esperado | Técnica | Teste automatizado |
| --- | --- | --- | --- | --- | --- |
| CT-CYC-001 | Mensal sem fechamento | Regra `dueDay = 10`, janela jan–abr/2026 | 4 ciclos, um por mês civil, vencimento dia 10, sem ciclo ponte | CP | `application/services/cycle-window.engine.spec.ts` |
| CT-CYC-002 | Fatura de cartão (fechamento dia 3) | `closingDay = 3`, `dueDay = 10` | Ciclo de 04 a 03 do mês seguinte; fechamento e vencimento corretos; ciclos contíguos | CP | idem |
| CT-CYC-003 | Fim do acordo | `endsAt = 15/02/2026` | Não gera ciclos que começam depois do fim | BVA | idem |
| CT-CYC-004 | Intervalo bimestral | `interval = 2` | Ciclos de 2 meses | EP | idem |
| CT-CYC-005 | Acordo pontual (`ONCE`) | Dentro e fora do horizonte | 1 ciclo / lista vazia | EP | idem |
| CT-CYC-006 | Anual e semanal | Janelas longas | Ciclos contíguos e ordenados | CP | idem |
| CT-CYC-007 | Troca de regra no meio do ciclo | Regra 2 vigora em 15/03 | Ciclo ponte com a nova regra; demais ciclos seguem suas regras; contiguidade preservada | CP | idem |
| CT-CYC-008 | Regras fora de ordem | Mesmas regras embaralhadas | Mesmo resultado; o array de entrada não é alterado | CB | idem |
| CT-CYC-009 | Critério de pertencimento | `DUE_DATE` × `OVERLAP` | `DUE_DATE` exige o vencimento na janela (limite inclusivo); `OVERLAP` basta interseção | EP + BVA | idem › anchorMode |
| CT-CYC-010 | Resolver ciclo de uma data | Sem regras; data antes da primeira regra | `null`; usa a primeira regra | CB | idem › resolveWindowForDate |
| CT-CYC-011 | **Trava de 500 iterações** | Janela semanal de 21 anos | **Defeito NC-08:** devolve 500 de ~1.090 ciclos sem sinalizar | CB | `cycle-window.engine.limits.spec.ts` (1 `todo`) |

## Estratégias por frequência (`CycleEngineRegistry`)

| ID | Caso | Entrada | Resultado esperado | Técnica | Teste automatizado |
| --- | --- | --- | --- | --- | --- |
| CT-CYC-020 | Mensal: dia limitado ao fim do mês | `dueDay = 31` em fevereiro (comum e bissexto) | 28 / 29 | BVA | `application/services/cycle-engine.registry.spec.ts` |
| CT-CYC-021 | Mensal: vencimento antes do fechamento | `closingDay = 25`, `dueDay = 5` | Vence no mês seguinte ao fechamento | EP | idem |
| CT-CYC-022 | Mensal: dia do fechamento | Cursor no dia 3 e no dia 4 | Dia 3 fecha o ciclo; dia 4 abre o próximo | BVA | idem |
| CT-CYC-023 | `ONCE` com e sem data final | Com `endsAt`; sem `endsAt` e `dueDay = 31` | Vence na data final; vence no último dia do mês | EP | idem |
| CT-CYC-024 | Semanal | Intervalo 1 e 2; 60 cursores consecutivos | Ciclos de 7/14 dias que sempre contêm o cursor | CP + propriedade | idem |
| CT-CYC-025 | Anual | Vencimento mar/10; fechamento nov/30 e vencimento fev/10; intervalo bienal | Vencimento no ano correto; rótulo pelo ano do vencimento | EP | idem |
| CT-CYC-026 | `stepDate` | Avançar e recuar por frequência e intervalo | Deslocamento correto; intervalo 0 tratado como 1 | BVA | idem |

## Serviços puros

| ID | Caso | Entrada | Resultado esperado | Técnica | Teste automatizado |
| --- | --- | --- | --- | --- | --- |
| CT-CYC-030 | Resumo financeiro | Ciclos `PAID`, `OPEN`, `OVERDUE`, `PARTIAL`, `TRANSFERRED` | Soma total/pago; vencidos separados dos pendentes; liquidados não entram em pendentes | CP | `application/services/cycle-pure-services.spec.ts` › CycleSummaryCalculator |
| CT-CYC-031 | Paginação em memória | 25 itens; `page` 0, -3, `NaN`, 2.9, além do fim | Padrões 1/10; trunca decimais; última página parcial; página vazia mantém o total | EP + BVA | idem › paginate |
| CT-CYC-032 | Horizonte | Ano civil, trimestre civil, janela deslizante (−2 a +9 meses), blocos de 10 anos | Intervalos esperados; `offset` desloca por bloco | CP | idem › CycleHorizonCalculator |
| CT-CYC-033 | Validador de vizinhança | Início depois do fim; fora da vigência; janela não canônica; limites exatos | `INVALID_RANGE_ORDER`, `OUT_OF_AGREEMENT_BOUNDS`, `NON_CANONICAL_CYCLE_WINDOW`; aceita os limites; devolve anterior, atual e próxima | EP + BVA | `application/services/cycle-detail.validator.spec.ts` |
| CT-CYC-034 | Schemas | Intervalo `from`/`to`; 9 status; filtros | `from ≤ to` (inclusive), formato `YYYY-MM-DD` | EP + BVA | `cycle-pure-services.spec.ts` › Schemas de ciclo |

## Casos de aplicação (use-cases)

| ID | Caso | Entrada / pré-condição | Resultado esperado | Técnica | Teste automatizado |
| --- | --- | --- | --- | --- | --- |
| CT-CYC-040 | Detalhe de um ciclo | Cartão com regra de fechamento; intervalo canônico | Saldos, regra e navegação (anterior e próximo) corretos; agrega só o ciclo atual com projetados | CP | `application/use-cases/get-cycle-detail.usecase.spec.ts` |
| CT-CYC-041 | Detalhe sem intervalo | Sem `range` | Resolve o ciclo ativo de hoje | CP | idem |
| CT-CYC-042 | Detalhe: entradas inválidas | Acordo inexistente; sem regras; intervalo invertido, não canônico ou fora da vigência; sem linha agregada | Mensagem específica em cada caso; nenhuma agregação indevida | EP | idem |
| CT-CYC-043 | Detalhe: acordo `ONCE` | Frequência pontual | Marca `isOnce`; sem vizinhos | CP | idem |
| CT-CYC-044 | Opções de fatura do cartão | Regras do ano; `offset`; filtro de status | Mapeia linhas para opções; consulta o ano civil; agrega como `CREDIT` incluindo projetadas | CP | `application/use-cases/get-card-invoice-options.usecase.spec.ts` |
| CT-CYC-045 | Opções: sem regras / regra futura | Lista vazia / regra só a partir de 2030 | Erro "nenhuma regra" / lista vazia | EP | idem |
| CT-CYC-046 | Acesso e falhas | Erro de acesso, sem permissão, exceção | Mensagens de permissão e "erro interno" | CB | ambos os specs |

## Testes já existentes (anteriores a esta etapa)

- `infra/repositories/cycle-prisma.queries.spec.ts` (**depende de Postgres**).
