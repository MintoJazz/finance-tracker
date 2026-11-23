# Testes do módulo `categories`

Casos de teste no formato IEEE 829 (resumido), ligados aos testes automatizados.
Executar: `npx tsx --test "modules/categories/**/*.spec.ts"`.

**Pré-condição comum:** sessão com `contextId = 100`; categorias são raízes (`parentId = null`) ou subcategorias (`parentId` de uma raiz); a hierarquia tem **no máximo um nível**.

## Regras de domínio (`CategoryPolicy`)

| ID | Regra | Entrada | Resultado esperado | Técnica | Teste automatizado |
| --- | --- | --- | --- | --- | --- |
| CT-CAT-001 | R1: arquivar categoria raiz | Raiz ativa / subcategoria / raiz já arquivada | Permite / `INVALID_HIERARCHY_LEVEL` / `ALREADY_ARCHIVED` | EP | `application/policies/category.policy.spec.ts` › validateCanArchiveCategory |
| CT-CAT-002 | R2 e R5: arquivar subcategoria | Ativa com pai ativo ou ausente / raiz / já arquivada / pai arquivado | Permite / `INVALID_HIERARCHY_LEVEL` / `ALREADY_ARCHIVED` / `DATA_INCONSISTENCY` | EP | idem › validateCanArchiveSubcategory |
| CT-CAT-003 | R3: restaurar raiz | Arquivada / subcategoria / ativa | Permite / `INVALID_HIERARCHY_LEVEL` / `NOT_ARCHIVED` | EP | idem › validateCanRestoreCategory |
| CT-CAT-004 | R4: restaurar subcategoria exige pai ativo | Pai ativo / pai ausente / pai arquivado / pai que é subcategoria | Permite / `PARENT_ARCHIVED` / `PARENT_ARCHIVED` / `INVALID_HIERARCHY_LEVEL` | EP | idem › validateCanRestoreSubcategory |
| CT-CAT-005 | R6: criar categoria (um nível) | Raiz; subcategoria sob raiz ativa; nome vazio ou só espaços; pai ausente; pai que é subcategoria; pai arquivado | Permite; permite; `EMPTY_NAME`; `PARENT_NOT_FOUND`; `INVALID_HIERARCHY_LEVEL`; `PARENT_ARCHIVED` | EP | idem › validateCanCreateCategory |
| CT-CAT-006 | Editar categoria | Ativa com nome válido / arquivada / nome em branco | Permite / `ALREADY_ARCHIVED` / `EMPTY_NAME` | EP | idem › validateCanUpdateCategory |
| CT-CAT-007 | Validação de existência | Categoria e subcategoria inexistentes, trocadas de nível, arquivadas ou de outro pai | Códigos `*_NOT_FOUND`, `*_IS_*`, `*_ARCHIVED`, `SUBCATEGORY_PARENT_MISMATCH` | EP | idem › validateExistingCategory / validateExistingSubcategory |

## Casos de aplicação (use-cases)

| ID | Caso | Entrada / pré-condição | Resultado esperado | Técnica | Teste automatizado |
| --- | --- | --- | --- | --- | --- |
| CT-CAT-010 | Criar, arquivar e restaurar (categoria e subcategoria) | `canManageBalances` | Delega ao repositório com `contextId` da sessão e devolve o resultado | CP | `application/use-cases/category-mutations.use-cases.spec.ts` |
| CT-CAT-011 | Mutação sem permissão | `canManageBalances = false` | Mensagem de permissão; repositório não é chamado | CP | idem › nega quem não pode gerenciar saldos |
| CT-CAT-012 | Erro de domínio do repositório | Repositório lança `CategoryDomainError` (ou subclasse) | Falha com a mensagem original do domínio | CB | idem › converte erro de domínio |
| CT-CAT-013 | Erro inesperado | Repositório lança `Error` | Mensagem genérica específica da operação | CB | idem › converte erro inesperado |
| CT-CAT-014 | Editar categoria | Ativa / inexistente / arquivada / nome em branco | Atualiza / "não encontrada" / "arquivada" / mensagem de domínio | CP | `application/use-cases/update-category.use-case.spec.ts` |
| CT-CAT-015 | Árvore de categorias | Sem filtro | Mês corrente, página 1 com 6 itens, `totalAmount = 0` | CP | `category-queries.use-cases.spec.ts` › GetCategoriesTreeUseCase |
| CT-CAT-016 | Árvore com período, busca e paginação informados | `from`, `to`, `search`, `pageRequest` | Repassa exatamente o informado | CP | idem |
| CT-CAT-017 | Informações básicas: escopo | Sem id; raiz; categoria com filhos (mesmo com pai); subcategoria folha | `OVERVIEW`; `ROOT`; `ROOT`; `LEAF` com nome do pai e abas próprias | EP + BVA (`childrenCount > 0`) | idem › GetCategoryBasicInfoUseCase |
| CT-CAT-018 | Informações básicas: id inválido | `"abc"`, `-1`, `1.5`; categoria inexistente | "Identificador de categoria inválido." / "Categoria não encontrada." | EP | idem |
| CT-CAT-019 | Leituras sem permissão ou com falha | Erro de acesso; `canViewBalances = false`; exceção | Erro propagado; mensagem de permissão; mensagem genérica | CB | idem › Use-cases de leitura de categorias — acesso |

## Casos de validação (schemas)

| ID | Campo | Valores | Resultado esperado | Técnica | Teste automatizado |
| --- | --- | --- | --- | --- | --- |
| CT-CAT-020 | `name` | vazio; só espaços; 1; 50; 51 caracteres | Rejeita, rejeita, aceita, aceita, rejeita | EP + BVA | `models/category.schema.spec.ts` › CategoryFormSchema |
| CT-CAT-021 | `parentId` | `0`; `-1`; `1.5`; `"2"`; `null`; ausente | Só inteiro positivo, nulo ou ausente | EP | idem |
| CT-CAT-022 | `id` das ações | `1`; `0`; `-2`; `1.5`; ausente | Aceita só inteiro positivo | EP + BVA | idem › Schemas de id |
| CT-CAT-023 | Árvore recursiva (`CategoryItemSchema`, `findCategoryInTree`) | Filhos aninhados, itens inexistentes, lista vazia | Defaults aplicados; busca encontra em qualquer profundidade; `null` se ausente | CP | idem |

## Testes já existentes (anteriores a esta etapa)

- `application/services/category-classification.resolver.spec.ts`
