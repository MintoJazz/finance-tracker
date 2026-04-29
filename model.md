# FinTracker — Modelagem de Domínio (MVP)

## Visão Geral

O modelo é construído em torno de um invariante central:

> **Toda movimentação de dinheiro tem origem, destino e valor — e isso é sempre rastreável.**

A separação entre `Transaction` e `Movement` é o que permite suportar operações complexas (split, transferência, reembolso) sem poluir o estado persistido.

---

## Mapa de Entidades

```
User ──── Membership ──── Workspace
                              │
              ┌───────────────┼───────────────┐
           Bucket          Transaction     (Category)
              │                │            futura
              └──── Movement ──┘
```

---

## Enums

### `BucketType`
Define a natureza contábil do bucket. Afeta como o saldo é interpretado.

| Valor | Semântica | Saldo negativo? |
|---|---|---|
| `WALLET` | Conta corrente, dinheiro real | Não |
| `CREDIT` | Crediário, fiado — valor presumido | Sim — representa dívida |
| `RESERVE` | Caixinha, reserva mensal ou esporádica | Não |

> **Nota:** Buckets do tipo `CREDIT` invertem a lógica de saldo — uma despesa aumenta o que você deve, não diminui o que você tem. Isso impacta a view de `BucketBalance`.

---

### `TransactionStatus`
Representa o ciclo de vida de uma transação. A transição entre estados é unidirecional — exceto `CANCELLED`, que pode vir de qualquer estado ativo.

```
PROJECTED ──── (vence) ──── PENDING ──── (confirma) ──── SETTLED
                                └──────── (ignora) ──── CANCELLED
```

| Valor | Semântica | Quem origina |
|---|---|---|
| `PROJECTED` | Lançado no futuro, não venceu ainda | Usuário ou Sistema |
| `PENDING` | Venceu, aguarda confirmação | Sistema (ao vencer) |
| `SETTLED` | Confirmado/pago | Usuário |
| `CANCELLED` | Estornado ou ignorado | Usuário |

> **Regra:** Transações manuais sem data futura nascem como `PENDING`. Transações com data futura nascem como `PROJECTED`. A transição `PROJECTED → PENDING` ocorre quando a data de competência passa — por job agendado ou lazy evaluation na query.

---

### `MovementRole`
Descreve o papel contábil da movimentação dentro da transação. Permite distinguir o tipo de operação no extrato do bucket sem precisar de join na transação.

| Valor | Semântica | Quando aparece |
|---|---|---|
| `DEBIT` | Saída simples | Despesa |
| `CREDIT` | Entrada simples | Receita |
| `TRANSFER_DEBIT` | Saída de transferência | Bucket de origem |
| `TRANSFER_CREDIT` | Entrada de transferência | Bucket de destino |

> **Extensibilidade:** Quando o reembolsável for implementado, adiciona-se `REIMBURSEMENT_DEBIT` e `REIMBURSEMENT_CREDIT` ao enum — sem alterar nada existente.

---

## Entidades

### `User`
Identidade do sistema. No MVP é simples — sem auth implementada, só o elo existe.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | Int PK | — |
| `email` | String unique | — |

---

### `Workspace`
Unidade de isolamento financeiro. Uma família, um casal ou uma empresa operam dentro de um workspace. Recursos não pertencem a usuários — pertencem ao workspace.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | Int PK | — |
| `name` | String | — |

---

### `Membership`
Elo entre `User` e `Workspace`. Chave primária composta — um usuário pode pertencer a múltiplos workspaces.

| Campo | Tipo | Notas |
|---|---|---|
| `userId` | Int FK | — |
| `workspaceId` | Int FK | — |

> **Feature futura:** `role` (ADMIN, VIEWER) entra aqui quando permissões forem necessárias.

---

### `Bucket`
A conta real onde o saldo reside. Pertence ao workspace, pode ter um dono (`User`) para triangulação de gastos por pessoa.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | Int PK | — |
| `workspaceId` | Int FK | Escopo do workspace |
| `ownerId` | Int? FK → User | Nullable — bucket sem dono é compartilhado |
| `name` | String | — |
| `type` | BucketType | WALLET, CREDIT, RESERVE |

> **Triangulação por pessoa:** Para saber quanto um membro gastou, você filtra as movimentações pelos buckets que ele possui — sem FK na transação.

---

### `Transaction`
O evento financeiro abstrato. Representa a intenção — "fui ao mercado", "paguei o aluguel". O valor real circula pelas movimentações.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | Int PK | — |
| `workspaceId` | Int FK | — |
| `description` | String | — |
| `amount` | Int | Em centavos — evita float |
| `competenceDate` | DateTime | Data do evento, não do pagamento |
| `status` | TransactionStatus | — |
| `seriesId` | Int? | Nullable — preenchido quando Series existir |
| `createdAt` | DateTime | — |

> **`amount` em centavos:** Nunca use float para dinheiro. R$ 15,90 é armazenado como `1590`.

> **`seriesId` nullable:** A tabela `Series` não existe no MVP, mas a FK já está reservada. Quando recorrências forem implementadas, nenhuma migration toca nas transações existentes.

> **Feature futura:** `categoryId` entra aqui como nullable quando `Category` for implementada.

---

### `Movement`
O registro contábil prático. Uma transação é composta por N movimentações — cada uma representa uma "perna" da operação, ligando a transação a um bucket real.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | Int PK | — |
| `transactionId` | Int FK | — |
| `bucketId` | Int FK | — |
| `amount` | Int | Em centavos |
| `role` | MovementRole | DEBIT, CREDIT, TRANSFER_DEBIT, TRANSFER_CREDIT |

---

## Padrões de Movimentação por Tipo de Transação

### Despesa simples
```
Transaction (amount: 1500)
  └── Movement (role: DEBIT,  bucket: Carteira,  amount: 1500)
```

### Despesa com split
```
Transaction (amount: 1500)
  ├── Movement (role: DEBIT, bucket: Carteira João, amount: 1000)
  └── Movement (role: DEBIT, bucket: Carteira Maria, amount: 500)
```

### Receita
```
Transaction (amount: 3000)
  └── Movement (role: CREDIT, bucket: Carteira, amount: 3000)
```

### Transferência
```
Transaction (amount: 500)
  ├── Movement (role: TRANSFER_DEBIT,  bucket: Carteira, amount: 500)
  └── Movement (role: TRANSFER_CREDIT, bucket: Reserva,  amount: 500)
```

---

## O que fica fora do MVP

| Feature | Como a porta foi deixada aberta |
|---|---|
| Auth / login | `User` existe, sem implementação de sessão |
| Permissões por workspace | `Membership` existe, sem campo `role` |
| Categorias | `categoryId` nullable na `Transaction` |
| Recorrências (`Series`) | `seriesId` nullable na `Transaction` |
| Reembolsável | `REIMBURSEMENT_DEBIT/CREDIT` no enum + `RefundGroup` futura |

> **Princípio aplicado:** Novas features adicionam tabelas e valores de enum — não alteram colunas existentes.