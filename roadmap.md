# FinanceTracker — Plano de Ação e Contexto

## O que é o projeto

ERP doméstico focado em gestão financeira pessoal. A ideia central é rastrear toda movimentação de dinheiro com origem, destino e valor — suportando operações simples e complexas via separação entre `Transaction` e `Movement`.

Contexto pessoal: projeto principal de portfólio, candidato a TCC (cursando 4º semestre de 6). Sendo desenvolvido nos fins de semana.

---

## Stack

- **Framework:** Next.js (App Router, serverless com Server Actions — sem API separada)
- **ORM:** Prisma
- **UI:** shadcn/ui + Tailwind
- **Formulários:** react-hook-form + zod
- **Linguagem:** TypeScript

---

## Modelagem de domínio (resumo)

### Entidades principais

- `User` / `Workspace` / `Membership` — isolamento por workspace (família, casal, etc.)
- `Bucket` — conta onde o saldo reside (tipos: `WALLET`, `CREDIT`, `RESERVE`)
- `Transaction` — o evento financeiro abstrato (o "fui ao mercado")
- `Movement` — a perna contábil real, liga transaction a bucket

### Enums relevantes

- `TransactionStatus`: `PROJECTED → PENDING → SETTLED | CANCELLED`
- `MovementRole`: `DEBIT`, `CREDIT`, `TRANSFER_DEBIT`, `TRANSFER_CREDIT`
- `TransactionType`: `EXPENSE`, `INCOME`, `TRANSFER`

### Padrões de movimentação

- Despesa: 1 movement `DEBIT`
- Receita: 1 movement `CREDIT`
- Transferência: 1 `TRANSFER_DEBIT` + 1 `TRANSFER_CREDIT`
- Split (fora do MVP): múltiplos `DEBIT` em buckets diferentes

---

## Como o draft list funciona

O planner não salva imediatamente — funciona como um "commit em massa". As alterações ficam em memória como drafts até o usuário confirmar tudo.

- `add(domain)` — adiciona item novo com id negativo (começando em `-1`, decrementando)
- `edit(id, partial, original)` — acumula mudanças; se voltar ao original, descarta o draft
- `remove(id)` — marca como removido (ou descarta se for item novo)
- `items` — computed: originals com edits aplicados + novos drafts no final

O visual de cada card é determinado pelo `getAction(id)` que busca `drafts[id].action`:

- `"add"` → verde (emerald)
- `"edit"` → amarelo (amber)
- `"remove"` → vermelho (rose)
- `"stable"` → neutro

---

## Estado atual de implementação

### Feito

- Listagem de transações puxando do banco via Server Action
- Status badge clicável com transição de estados
- Share switcher (booleano de regra de negócio)
- Draft list com lógica de edição otimista
- Estrutura do formulário de inserção com schema dinâmico por badges
- Movement builder registry (`toDomain` gera movements corretos por tipo)
- Inserção de despesas: estrutura pronta

---

## MVP — escopo fechado

**3 telas. Nada além disso.**

| Tela      | O que entrega                                                 |
| --------- | ------------------------------------------------------------- |
| Planner   | Listar + inserir transações (despesa, receita, transferência) |
| Buckets   | Listar e criar contas/carteiras                               |
| Dashboard | Saldo por bucket                                              |

### Fora do MVP (documentar no README como roadmap)

- Edição de transações — cancela e recria no MVP
- Split de despesas
- Reembolsável
- Recorrências / Series
- Categorias
- Faturas de cartão
- Módulo de compras (OrderTracker)
- Auth / login
- Permissões por workspace

---

## Ordem de implementação sugerida

1. **Inserção de receitas** — já tem o builder, é só habilitar no form
2. **Inserção de transferências** — badge `toTransfer` já existe no schema-registry, falta o campo de destino/origem no form
3. **Tela de Buckets** — listar e criar
4. **Dashboard** — saldo por bucket (query agregada nos movements)
5. **Persistência do planner** — Server Action de commit em massa
6. **README** com documentação da modelagem e roadmap
