# ADR 001: Separação entre Transaction e Movement (Padrão Ledger)

**Status:** Aceito
**Domínio:** Contábil / Banco de Dados

## 1. Problema

Aplicativos de finanças pessoais frequentemente iniciam com um modelo de dados simplificado, utilizando uma única tabela `Transaction` contendo colunas como `value`, `origin_account` e `destination_account`.

Embora esse modelo "Single Table" funcione para entradas simples de débito e crédito, ele entra em colapso rapidamente quando o domínio de negócios escala para cenários complexos, como:

* Divisão de contas em múltiplos meios de pagamento (*Split transactions*).
* Transferências que envolvem taxas embutidas deduzidas de uma terceira conta.
* Despesas parcialmente reembolsáveis.

Forçar essas mecânicas em uma única tabela exige a criação contínua de colunas opcionais (*nullable columns*), resultando em anomalias de banco de dados e lógicas condicionais frágeis no backend. Além disso, torna o cálculo de saldos altamente suscetível a erros matemáticos.

## 2. Decisão

Foi decidido abandonar o modelo de tabela única e adotar uma abstração baseada em **Partidas Dobradas (Double-entry bookkeeping)**.

O sistema separa estritamente o evento lógico de negócios do vetor de impacto financeiro, implementando uma relação de `1-para-N` entre as entidades `Transaction` e `Movement`.

Estabelece-se também uma **Invariante Contábil** para operações de transferência: a soma de todos os vetores (`Movements`) associados a uma transação de transferência deve ser sempre igual a zero.

$$\sum_{i=1}^{n} \text{Movement}_i = 0$$

## 3. Evidências e Implementação

A arquitetura reflete essa decisão em múltiplas camadas do sistema:

* **Modelagem Prisma (`types/database.ts`):** A interface `TransactionDetails` expõe a transação como uma âncora que carrega um array de `TransactionListMovement`.
* **Mapeamento Direcional (`MovementRole`):** O vetor financeiro não é apenas um número, ele possui um papel explícito (`DEBIT`, `CREDIT`, `TRANSFER_CREDIT`, `TRANSFER_DEBIT`) que dita seu comportamento no repositório final.
* **Transformadores Matemáticos (`features/transaction/mappers/`):** A lógica não injeta valores arbitrários no banco. Modificadores como `toTransfer` recebem a intenção de transferência e geram os vetores complementares automaticamente (ex: multiplicando o montante por $-1$ para o bucket de origem e mantendo positivo para o destino).

## 4. Motivação

O objetivo primário desta arquitetura é garantir **Extensibilidade e Tolerância Zero a Falhas Contábeis**.

Ao isolar os movimentos físicos, o cálculo de saldo de qualquer repositório de valor (`Bucket`) torna-se uma operação trivial e à prova de balas: basta aplicar uma agregação de soma (`_sum`) sobre todos os `Movements` vinculados àquele `Bucket`. O dinheiro não pode "surgir" ou "desaparecer", pois todo impacto financeiro exige a existência de um vetor rastreável.

Adicionalmente, essa modelagem é uma preparação explícita (Day 1) para o roadmap do ecossistema. Funcionalidades futuras que exijam múltiplos destinos do dinheiro não exigirão nenhuma *migration* estrutural no banco de dados.

## 5. Trade-offs (Consequências)

### Benefícios

* **Integridade Absoluta:** Elimina o risco de dessincronização de saldos (Single Source of Truth).
* **Escalabilidade de Domínio (Open/Closed):** Novos comportamentos financeiros (como divisão de contas) são suportados inerentemente pelo esquema relacional atual.

### Custos Aceitos

* **Complexidade de Inserção:** A criação de um simples registro de compra agora exige operações transacionais no banco (garantindo que a `Transaction` e os `Movements` sejam salvos ou revertidos de forma atômica via `prisma.$transaction`).
* **Queries Mais Densas:** A leitura de extratos financeiros exige operações de `JOIN` (ou `include` no ORM) constantes, o que apresenta um leve overhead de leitura em comparação a tabelas desnormalizadas.

## 6. Alternativas Descartadas

* **Colunas Nulas (Single Table):** O uso de `originBucketId` e `destinationBucketId` diretamente na tabela de `Transaction` foi rejeitado por limitar a transação a apenas dois atores, inviabilizando operações multipartes futuras.