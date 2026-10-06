# Ledger: Reembolso e Rateio

Documento de decisões e linhas do tempo para cobrança entre contextos.
Não exige mudança de schema. Tudo é expresso com `Entry`, `Movement` e `Balance`.

---

## 1. Princípios (decisões já tomadas)

1. **Caminho único de posse:** `Party → ContextMember → FinancialContext → Balance → Movement → Entry`.
   Não existe vínculo `Balance ↔ Party` nem `Entry ↔ Party`. Quem é dono de um balance é o contexto onde ele mora.
2. **Contexto pessoal = contexto em que a party é `OWNER`.** Premissa: uma party é `OWNER` de no máximo um contexto.
   A cobrança lista os contextos aos quais eu tenho acesso e os contextos pessoais dos meus amigos.
3. **Sem tabela de proposta e sem coluna `status`.** O estado é derivado dos movements e dos `REVERSAL`.
4. **Entries são revertidas, não editadas.** `reversesEntryId` é `@unique`, então cada entry tem no máximo um estorno.
   Valor errado = reverter e criar outra.
5. **Marcador:** para ligar entries ao mesmo balance, a entry adiciona um par de movements que se anulam
   (`+X DEBIT` e `-X CREDIT`) no balance. Não altera saldo, só registra que a entry reclassificou aquela obrigação.
6. **Consentimento:** a despesa só migra para o contexto de quem deve **depois do aceite**.
   Sem resposta ou com recusa, a despesa continua com quem pagou.

### Convenção de sinais (não imposta pelo schema, deve ficar no código)

| Tipo       | Sinal    | Significado      |
| ---------- | -------- | ---------------- |
| Categoria  | positivo | despesa          |
| Commitment | negativo | dívida (a pagar) |
| Commitment | positivo | a receber        |

### Tipos de entry usados

| Passo                       | `EntryType`  |
| --------------------------- | ------------ |
| Despesa comum               | `DIRECT`     |
| Cobrança / proposta de cota | `ACCRUAL`    |
| Aceite                      | `ADJUSTMENT` |
| Pagamento / recebimento     | `SETTLEMENT` |
| Recusa / desfazer           | `REVERSAL`   |

---

## 2. Linha do tempo A: Reembolso

Ana paga R$ 300 de uma conta que é do Bruno e cobra o reembolso. Uma cobrança, um devedor, 100% da despesa dele.

**E1. Ana paga** (`DIRECT`)

``` text
Categoria Energia   (ctx Ana)    +30000
Carteira Ana        (ctx Ana)    -30000
```

**E2. Ana cobra** (`ACCRUAL`)

``` text
Commitment A receber Luz  (ctx Ana)     +30000
Commitment Luz            (ctx Bruno)   -30000
Categoria Energia         (ctx Ana)     +30000 / -30000   (marcador: guarda de qual categoria sai a despesa)
```

O contexto de destino do Bruno é o contexto em que ele é `OWNER`.

**E3. Bruno aceita** (`ADJUSTMENT`)

``` text
Categoria Energia   (ctx Ana)     -30000
Categoria Energia   (ctx Bruno)   +30000   (categoria escolhida por ele)
Commitment Luz      (ctx Bruno)   +30000 / -30000   (marcador)
```

**E3'. Bruno recusa** (`REVERSAL` da E2)

``` text
Commitment A receber Luz  (ctx Ana)     -30000
Commitment Luz            (ctx Bruno)   +30000
```

Volta ao estado da E1.

**E4. Bruno paga** (`SETTLEMENT`, 100% no contexto dele)

``` text
Commitment Luz   (ctx Bruno)   +30000
Carteira Bruno   (ctx Bruno)   -30000
```

**E5. Ana confirma o recebimento** (`SETTLEMENT`)

``` text
Commitment A receber Luz   (ctx Ana)   -30000
Carteira Ana               (ctx Ana)   +30000
```

Ana escolhe a carteira, porque o Bruno não enxerga o contexto dela.

### Estado após cada passo (valores em R$)

| Após         | Despesa Ana | Despesa Bruno | Carteira Ana | Carteira Bruno | A receber (Ana) | Dívida (Bruno) |
| ------------ | ----------- | ------------- | ------------ | -------------- | --------------- | -------------- |
| E1           | 300         | 0             | -300         | 0              | 0               | 0              |
| E2           | 300         | 0             | -300         | 0              | +300            | -300           |
| E3           | 0           | 300           | -300         | 0              | +300            | -300           |
| E4           | 0           | 300           | -300         | -300           | +300            | 0              |
| E5           | 0           | 300           | 0            | -300           | 0               | 0              |
| E3' (recusa) | 300         | 0             | -300         | 0              | 0               | 0              |

Entre E4 e E5 o dinheiro está "em trânsito" (dívida zerada, a receber aberto). Esse estado é derivável.

### Estado derivado (commitment do Bruno)

| Estado        | Entries que tocam o balance |
| ------------- | --------------------------- |
| Pendente      | só E2                       |
| Aceita        | E2 + E3 (`ADJUSTMENT`)      |
| Recusada      | E2 + `REVERSAL` da E2       |
| Aceita e paga | E2 + E3 + E4 (saldo zero)   |

---

## 3. Linha do tempo B: Rateio

Conta de R$ 300 entre Ana (cria a obrigação), Bruno e Carla. Cada cota é R$ 100.
O contexto do grupo guarda só o commitment da obrigação, que é a conta de passagem.

### B1. Sem adiantamento (cada um paga a sua cota)

**E1. Ana reconhece a obrigação** (`ACCRUAL`)

``` text
Categoria Energia   (ctx Ana)     +30000
Commitment Luz      (ctx Grupo)   -30000
```

**E2. Ana propõe a cota** (`ACCRUAL`, uma por membro, inclusive a da própria Ana)

``` text
E2-Bruno:  Commitment Luz (ctx Grupo)   +10000
           Commitment Luz (ctx Bruno)   -10000
           Categoria Energia (ctx Ana)  +10000 / -10000   (marcador)

E2-Carla:  idem, com ctx Carla

E2-Ana:    Commitment Luz (ctx Grupo)   +10000
           Commitment Luz (ctx Ana)     -10000
```

O commitment do grupo zera quando todas as cotas são propostas. Nenhuma categoria muda nesta etapa.

**E3. Membro aceita** (`ADJUSTMENT`)

``` text
Categoria Energia   (ctx Ana)      -10000
Categoria Energia   (ctx Bruno)    +10000   (categoria escolhida por ele)
Commitment Luz      (ctx Bruno)    +10000 / -10000   (marcador)
```

**E3'. Membro recusa** (`REVERSAL` da E2-Bruno)

``` text
Commitment Luz (ctx Grupo)   -10000
Commitment Luz (ctx Bruno)   +10000
```

Os R$ 100 voltam a ficar abertos no grupo. Ana pode propor de novo (por exemplo, para a Carla) com uma nova E2.

**E4. Membro paga** (`SETTLEMENT`, 100% no contexto dele)

``` text
Commitment Luz   (ctx Bruno)   +10000
Carteira/Cartão  (ctx Bruno)   -10000
```

Para cartão, a data da entry define a fatura.

| Após               | Despesa Ana | Despesa Bruno | Commitment Grupo | Commitment Bruno |
| ------------------ | ----------- | ------------- | ---------------- | ---------------- |
| E1                 | 300         | 0             | -300             | 0                |
| E2 (todos)         | 300         | 0             | 0                | -100             |
| E3 (Bruno aceita)  | 200         | 100           | 0                | -100             |
| E3' (Bruno recusa) | 300         | 0             | -100             | 0                |
| E4 (Bruno paga)    | 200         | 100           | 0                | 0                |

Quando Bruno e Carla aceitam, a despesa da Ana cai para R$ 100.

### B2. Com adiantamento (Ana paga o fornecedor e o grupo a reembolsa)

Mesma E1. A Ana não tem commitment próprio.

**E1b. Ana paga o fornecedor** (`SETTLEMENT`)

``` text
Commitment Luz   (ctx Grupo)   +30000
Carteira Ana     (ctx Ana)     -30000
```

**E2. Só as cotas dos outros** (`ACCRUAL`, uma por membro)

``` text
E2-Bruno:  Commitment Luz (ctx Grupo)   +10000
           Commitment Luz (ctx Bruno)   -10000
           Categoria Energia (ctx Ana)  +10000 / -10000   (marcador)
E2-Carla:  idem
```

A cota da Ana não gera entry, porque já está na categoria dela.
O commitment do grupo fica em **+20000**, que é o reembolso a receber.

**E3 e E4** são iguais aos de B1.

**E5. Ana confirma o recebimento** (`SETTLEMENT`)

``` text
Commitment Luz   (ctx Grupo)   -10000
Carteira Ana     (ctx Ana)     +10000
```

| Após               | Despesa Ana | Despesa Bruno | Carteira Ana | Commitment Grupo | Commitment Bruno |
| ------------------ | ----------- | ------------- | ------------ | ---------------- | ---------------- |
| E1                 | 300         | 0             | 0            | -300             | 0                |
| E1b                | 300         | 0             | -300         | 0                | 0                |
| E2 (Bruno e Carla) | 300         | 0             | -300         | +200             | -100             |
| E3 (Bruno e Carla) | 100         | 100           | -300         | +200             | -100             |
| E4 (Bruno)         | 100         | 100           | -300         | +200             | 0                |
| E5 (Bruno)         | 100         | 100           | -200         | +100             | 0                |

A ordem de E1b e E2 não importa, porque o saldo final do grupo é o mesmo.
Pagar antes de aceitar é possível, porque E3 e E4 são independentes.

> **Relação entre os fluxos:** o rateio com adiantamento (B2) equivale a **um reembolso (A) por devedor**,
> mas com o saldo a receber concentrado no commitment do grupo.
> Limite: se duas pessoas adiantarem partes da **mesma** obrigação, o saldo do grupo mistura os credores.
> Nesse caso, cada adiantamento precisa de seu próprio commitment de grupo.

---

## 4. Reversões (ordem inversa obrigatória)

| Situação                 | Sequência de estornos               |
| ------------------------ | ----------------------------------- |
| Recusar antes do aceite  | `REVERSAL` da E2                    |
| Desfazer o aceite        | `REVERSAL` da E3 (volta a pendente) |
| Recusar depois do aceite | E3, depois E2                       |
| Desfazer depois de pago  | E4, depois E3, depois E2            |
| Perdoar a cobrança       | E3 (se houver), depois E2           |

---

## 5. Regras que o use-case precisa impor

1. A E3 só existe se a E2 existe e não foi revertida, com **no máximo uma E3 ativa por commitment**.
2. O tipo diferencia o papel: `ADJUSTMENT` = aceite, `SETTLEMENT` = quitação.
   Não usar `ADJUSTMENT` com outro sentido em balances de commitment de cobrança.
3. A categoria escolhida no aceite deve pertencer ao contexto do commitment.
4. A categoria de origem do aceite é lida do marcador da E2 (contexto de quem cobra).
5. Recusar uma E2 com E3 ativa deve ser rejeitado (reverter a E3 antes).
6. Todo passo valida: soma dos movements da entry = 0.
7. Relatórios por contexto trabalham por saldo de balance. Não assumem Σ entry = 0 dentro de um contexto,
   porque E2 e E3 atravessam contextos.
8. Commitment sem aceite é tratado como "a classificar" nos relatórios.
9. Arredondamento no rateio: definir o critério do resto de centavos e garantir Σ cotas = total.

---

## 6. Pontos em aberto

1. **Contexto pessoal = `OWNER` único.** O schema não impede uma party de ser `OWNER` de vários contextos.
   Hoje o seed faz isso: Ana é `OWNER` de "Finanças da Ana" e de "Casa Ana & Bruno" (`createSpace` usa `OWNER`).
   Para a premissa valer, é preciso decidir uma destas:
   - o criador de um espaço compartilhado recebe `ADMIN`;
   - ou há uma validação no use-case, ou um índice único parcial (`partyId` onde `role = OWNER`).
2. **Política de quem pode cobrar quem:** não existe configuração de `Friendship` ainda. Fica no `space.policy`,
   fora do ledger, quando for definida.
3. **Destino em contexto compartilhado:** pela premissa, o destino é sempre o contexto pessoal (`OWNER`) do devedor.
   Permitir outro destino (por exemplo, "Casa Ana & Bruno") é uma decisão futura.
4. **Pagamento parcial:** o commitment fica com saldo residual dos dois lados; a confirmação parcial é um
   `SETTLEMENT` de valor menor.
5. **Cobrança recorrente / `Recurrence`:** não coberta aqui. `CycleRule` não guarda proporções.
6. **Remoção de membro** (`REMOVED`): política para commitments abertos (quitar, transferir ou perdoar).
7. **Convenção de sinal do commitment:** precisa de comentário e teste no código, pois o schema não a impõe.
