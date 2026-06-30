# FinTracker: Modelagem de Dados e Invariante Contábil

## 1. O Padrão Ledger (Double-Entry Bookkeeping)

A modelagem de banco de dados do FinTracker rejeita a abordagem ingênua de armazenar origens e destinos em colunas fixas dentro de uma tabela de transação. Para garantir a rastreabilidade absoluta do dinheiro e suportar operações financeiras complexas (como *split payments* e divisão de faturas), o sistema implementa um padrão de **Partidas Dobradas** (*Ledger*).

Neste modelo, o dinheiro nunca "surge" ou "desaparece". Todo valor financeiro é movimentado através de vetores matemáticos, garantindo uma integridade estrita e criando uma base resiliente para as projeções futuras do sistema.

---

## 2. Anatomia das Entidades Financeiras

O diagrama relacional principal separa a intenção do negócio da realidade física do dinheiro utilizando três entidades centrais.

### 2.1. Transaction (O Evento de Negócio)

A `Transaction` é uma entidade de agrupamento lógico. Ela representa o evento financeiro do ponto de vista do usuário.

* Armazena os metadados temporais e descritivos (`description`, `date`).


* Define o estado de consolidação através da propriedade `status` (ex: `PROJECTED`, `PENDING`, `SETTLED`, `CANCELED`).


* Atua como a "âncora" relacional: ao excluir uma `Transaction`, o banco de dados propaga a exclusão em cascata (*Cascade Delete*) para todos os movimentos associados, revertendo o impacto financeiro imediatamente.



### 2.2. Movement (O Vetor Físico)

O `Movement` é a unidade atômica da modelagem. Representa o impacto financeiro real em um repositório de valor.

* Pertence obrigatoriamente a uma `Transaction` e, opcionalmente, atinge um `Bucket`.


* Carrega o impacto financeiro exato (`amount`) e um papel contábil (`role` como `DEBIT`, `CREDIT`, `TRANSFER_CREDIT` ou `TRANSFER_DEBIT`).


* **Invariante de Transferência:** Em operações de transferência entre contas, a inserção de *Movements* obedece à regra de soma zero $\sum \text{Movement}_i = 0$. O valor é creditado em um destino e matematicamente invertido no bucket de origem.



### 2.3. Bucket (O Repositório de Valor)

Representa as contas bancárias, carteiras físicas ou limites de cartão de crédito.

* O `Bucket` é tipado através do enum `BucketType` (`WALLET`, `CREDIT`, `RESERVE`), pavimentando o caminho para a especialização polimórfica de cálculos futuros (ex: tratar `CREDIT` como um acumulador negativo de limite).


* Adota o princípio de **Single Source of Truth** (Fonte Única da Verdade). A tabela `Bucket` não possui uma coluna `balance` estática sujeita a dessincronização.



---

## 3. Dinâmica de Estado e Segurança de Escrita

A separação entre `Transaction` e `Movement` exige mecanismos seguros de leitura e escrita para evitar anomalias de banco de dados.

### 3.1. Cálculo Dinâmico de Saldo (Balance Computation)

Para descobrir o saldo atual de um `Bucket`, o backend não lê uma coluna pré-calculada. Em vez disso, o sistema utiliza as capacidades de agregação do ORM (Prisma) para somar todos os vetores.

* Através de uma operação de agrupamento (`groupBy` e `_sum`), o saldo é sempre a soma matemática em tempo real de todos os *Movements* vinculados àquele repositório.


* Esse design impede completamente falhas comuns de "condição de corrida" (*race conditions*) que ocorrem quando múltiplas transações simultâneas tentam atualizar uma mesma coluna de saldo em sistemas menos maduros.

### 3.2. Transações ACID e Commits em Massa

Para suportar operações da interface do usuário — que envia múltiplos rascunhos (*Drafts*) de criação, edição e exclusão simultaneamente —, a camada de persistência (`persistDrafts`) empacota toda a carga de trabalho em uma única `prisma.$transaction`.

* Ou a árvore inteira de transações e movimentos é salva com sucesso, ou o lote inteiro sofre *rollback*.


* Isso protege a base de dados contra estados intermediários corrompidos causados por falhas de rede durante o processamento de conciliações em lote.