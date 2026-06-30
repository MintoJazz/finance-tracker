# FinTracker: Motor de Projeção e Domínio de Negócios

## 1. O Paradigma Reativo vs. Proativo

Aplicativos tradicionais de controle financeiro geralmente operam sob um paradigma estritamente **reativo**. Eles funcionam como blocos de notas glorificados (operações CRUD simples), desenhados para responder a uma única pergunta do usuário: _"O que aconteceu com meu dinheiro?"_.

Embora esse modelo atenda a necessidades básicas de registro, ele quebra rapidamente quando submetido às complexidades da saúde financeira de uma família, onde o passado importa menos que a previsibilidade do futuro.

O **FinTracker** foi concebido com uma ambição diferente. A arquitetura abandona o registro passivo para atuar como um **Motor de Projeção Financeira**. O sistema foi modelado para ser proativo, respondendo a uma pergunta muito mais valiosa e complexa de ser computada: _"O que temos para pagar, receber ou executar?"_.

Essa mudança de escopo exigiu a adoção de **Domain-Driven Design (DDD)** para isolar o desejo (planejamento) da realidade matemática (contabilidade).

---

## 2. Linguagem Ubíqua e Modelagem

Para suportar fluxos complexos como despesas reembolsáveis, divisão de faturas (_split transactions_), agendamentos e transações compostas, o domínio do sistema foi dividido em duas grandes fronteiras de responsabilidade.

### 2.1. O Domínio de Compromissos (Intenção e Tempo)

Este é o domínio que orquestra as regras de negócio de planejamento. Ele não afeta os saldos bancários de forma imediata, mas projeta o estado futuro do ecossistema financeiro.

- **Bill (A Protagonista):** É o epicentro do planejamento. Uma `Bill` representa um compromisso financeiro no tempo. Através do uso de um padrão de design polimórfico (composição de domínios), uma entidade _Bill_ pode assumir múltiplos comportamentos:
- Uma conta recorrente (luz, água).
- Um reembolso esperado de terceiros.
- O agrupamento projetado de uma fatura de cartão de crédito.
- Uma transferência planejada para investimentos.

A `Bill` não é uma operação matemática; ela é uma orquestradora. Ela decide _quando_ e _como_ as transações efetivas serão geradas.

### 2.2. O Domínio Contábil (Realidade e Execução)

A espinha dorsal matemática da aplicação. O Domínio Contábil (Ledger) lida estritamente com a efetivação do fluxo de caixa através do princípio de partidas dobradas (_Double-entry bookkeeping_). É um domínio imutável e com tolerância zero para anomalias de dados (dinheiro não pode ser criado do nada).

- **Transaction:** Representa o evento financeiro efetivado (ex: "Compra no Supermercado dia 15"). No contexto de projeção, uma `Transaction` atua apenas como a "perna de execução" de uma `Bill` preexistente ou de um evento imediato.
- **Movement:** A menor unidade transacional do sistema. Todo valor que entra ou sai de um local gera um ou mais _Movements_. O rastreamento direcional do dinheiro via _Movements_ garante a Invariante Contábil do sistema e flexibiliza funcionalidades avançadas sem alterar o modelo de dados.
- **Bucket:** Representa os repositórios reais de valor (Carteira física, Conta Corrente, Limite de Crédito). Adotando o princípio de _Single Source of Truth_ (Fonte Única da Verdade), o saldo de um Bucket **nunca é armazenado estaticamente** na entidade. O balanço é sempre um reflexo dinâmico agregado (`_sum`) dos seus _Movements_ no tempo.

---

## 3. Preparação para o Ecossistema (Microsserviços)

O FinTracker não é modelado como um monólito engessado, mas sim como a fundação de um ecossistema familiar.

A arquitetura do domínio está isolada de tal forma que clientes externos podem consumir regras financeiras sem conhecer a lógica contábil profunda. Um exemplo desse desenho é o futuro **Módulo de Compras**, que atuará como uma aplicação (ou microsserviço) totalmente separada:

- A "Lista de Compras" terá seu próprio domínio complexo (Pedidos, Itens, Histórico de Preços).
- Ao ser finalizada, ela interage com a API do FinTracker, enviando o total.
- O core do FinTracker consome a requisição gerando a respectiva `Bill` ou `Transaction`, resolvendo a matemática da carteira sem poluir o módulo de compras com tabelas contábeis.

---

### _Próximo Passo Recomendado_

_Leia o documento `ARCHITECTURE.md` para entender como o Feature-Sliced Design e o isolamento vertical organizam o código-fonte para suportar esses domínios sem perda de coesão._

---