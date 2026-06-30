# FinTracker: Roadmap e Evolução Arquitetural

O FinTracker foi arquitetado sob a premissa de que sistemas financeiros escalam em complexidade, não apenas em volume de dados. Este documento mapeia o ciclo de vida do projeto, detalhando a transição de um núcleo contábil estrito para um ecossistema de microsserviços e projeção financeira proativa.

---

## Fase 1: Core Financeiro (MVP)

**Status:** Concluído

Consolidação da espinha dorsal matemática do sistema. O objetivo desta fase foi garantir o registro de eventos financeiros com integridade absoluta (Tolerância Zero a falhas contábeis).

**Principais Entregas:**

* Implementação do padrão *Ledger* (Separação estrita entre `Transaction` e `Movement`).
* Modelagem e cálculo dinâmico de `Buckets`.
* Proteção de banco de dados via transações ACID no Prisma.
* Criação do Motor de Rascunhos Otimistas (*Draft List* + Commit em Massa).
* Arquitetura de Validação Dinâmica via *Badges* (`superRefine` e *Schema Registry*).
* Desenvolvimento dos modificadores de domínio (*Movement Builder Registry* e *Strategy Pattern*).

---

## Fase 2: Aprimoramento Técnico e Infraestrutura

**Status:** Em Andamento / Próximo Passo

Após a validação do MVP, o foco transiciona temporariamente da entrega de funcionalidades para o fortalecimento da base técnica. O objetivo é consolidar as fronteiras arquiteturais antes de expandir o domínio de negócios.

**Evolução da Arquitetura:**

* Introdução formal de uma camada de Aplicação (`Application Layer`).
* Isolamento das dependências de infraestrutura (repositórios, instâncias do Prisma e integrações externas).
* Refinamento do *Feature-Sliced Design*, padronizando o contrato dos Casos de Uso.

**Evolução do Frontend (Next.js):**

* Reestruturação do roteamento para extrair o máximo do *App Router*.
* Implementação de **Parallel Routes (Slots)** para navegação fluida em modais de alta densidade sem perda de contexto.
* Refinamento da *Adaptive UI* para zerar gargalos de renderização desnecessários no Mobile.

**Experiência do Desenvolvedor (DX):**

* Ampliação da documentação interna.
* Revisão de tipagens avançadas e utilitários genéricos.
* Padronização de convenções de *commits* e estruturação de pastas.

---

## Fase 3: O Domínio de Compromissos (Bills)

**Status:** Planejado

Esta fase representa o grande salto do projeto em direção ao "Motor de Projeção". Introduz-se o conceito de planejamento financeiro autônomo, separando a intenção da execução contábil.

**O Novo Fluxo de Domínio:**
A `Bill` assume o papel de protagonista e orquestradora. O fluxo deixa de nascer no registro direto e passa a seguir um ciclo de liquidação:

```text
  Bill (A Obrigação / O Planejamento)
   │
   ▼
  Liquidação (Ação do Usuário ou Automação)
   │
   ▼
  Transaction (O Evento de Negócio)
   │
   ▼
  Movements (Os Vetores Físicos no Banco)

```

**Principais Entregas:**

* Entidade `Bill` e sua máquina de estados.
* Motor de recorrência para projeção de fluxo de caixa futuro.
* Separação estrita entre Data de Competência e Data de Liquidação.

**Impacto Arquitetural:** Adiciona a camada preditiva de software sem necessitar de nenhuma alteração estrutural no modelo matemático e contábil desenvolvido na Fase 1.

---

## Fase 4: Especializações Polimórficas do Domínio

**Status:** Planejado

Com a fundação da `Bill` estabelecida, o sistema passa a suportar especializações profundas, demonstrando a extensibilidade do *Domain-Driven Design*.

### 4.1. Order Tracker (Lista de Compras)

Transforma a entidade `Bill` em um orquestrador de logística doméstica.

* **Modelagem:**
```text
Bill ──▶ Order ──▶ OrderItem ──▶ Item (Catálogo Histórico)

```


* **Impacto Arquitetural:** Esta será a primeira *feature* a justificar a exposição de uma API dedicada no Next.js (via *Route Handlers*). O Módulo de Compras atuará como um cliente externo descentralizado, consumindo a lógica contábil sem duplicar regras de negócio.

### 4.2. Invoices (Faturamento de Crédito)

Representação do ciclo de vida de cartões e limites de crédito.

* **Mecânica:** Diferente de uma compra comum, a *Invoice* não gera movimentações ativas por si só. Ela atua como um agrupador temporal de `Movements` atrelados a um `Bucket` do tipo `CREDIT`.
* **Impacto Arquitetural:** Prova a flexibilidade do design. Diferentes comportamentos financeiros (Recorrência, Compras, Faturas) compartilham o núcleo atômico da `Bill`, mas delegam comportamentos de negócio para implementações específicas.

---

## Fase 5: Regras Financeiras Avançadas

**Status:** Visão de Futuro

Após a estabilização completa do ecossistema de *Bills* e APIs, o domínio contábil será estressado com lógicas financeiras avançadas:

* **Split Transactions:** Distribuição granular de uma transação em múltiplos destinos e categorias (já suportada pela estrutura atômica de `Movements`).
* **Despesas Reembolsáveis:** Rastreamento de fluxo onde uma saída presente trava a projeção de uma entrada futura.
* **Rateios Inteligentes:** Divisão automática entre múltiplos responsáveis.
* **Estornos Seguros:** Reversão contábil de operações através de lançamento de vetores contrários, preservando a imutabilidade e o histórico das tabelas.

---

## Resumo da Árvore de Evolução

```text
Transaction
    │
    ▼
Movement (Estabilidade Core)
    │
    ▼
Bills (O Salto Preditivo)
    │
    ├─▶ Especialização: Order Tracker (Início da API/Microsserviços)
    │
    ├─▶ Especialização: Invoices (Agrupamento e Fechamento)
    │
    ▼
Regras Financeiras Avançadas (Split, Estorno, Rateio)

```