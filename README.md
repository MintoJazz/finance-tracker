# FinTracker: Motor de Projeção Financeira

> O FinTracker não é um simples aplicativo de registro de despesas (CRUD). É um **Motor de Projeção Financeira** arquitetado sob os princípios de *Domain-Driven Design (DDD)* e *Double-Entry Bookkeeping* (Partidas Dobradas). Ele foi projetado para responder proativamente a compromissos financeiros, garantindo tolerância zero a anomalias matemáticas.

## 🎯 Objetivo do Projeto

Este projeto foi desenvolvido como uma prova de conceito avançada e compõe meu portfólio de Engenharia de Software. O foco principal não é a entrega de telas básicas, mas a demonstração prática de **maturidade arquitetural, resiliência de dados e otimização de UX em cenários de alta densidade de informações.**

## 🛠 Stack Tecnológica

* **Core & API:** Next.js (App Router) + Server Actions
* **Linguagem:** TypeScript (Uso intensivo de *Generics* e inferência avançada)
* **Banco de Dados & ORM:** PostgreSQL + Prisma ORM (Transações ACID)
* **Validação e Domínio:** Zod (Validação dinâmica via `superRefine` e Padrão *Registry*)
* **Interface:** React, TailwindCSS v4, Shadcn UI
* **Arquitetura de Código:** Feature-Sliced Design (Vertical Slicing)

## 📚 Documentação de Engenharia (Para Avaliadores)

Se você está avaliando este repositório durante um processo seletivo, recomendo pular o código fonte inicial e iniciar a leitura pela documentação arquitetural. O projeto conta com um registro profundo de decisões e *trade-offs*.

### Visão e Modelagem (Core)

1. [Visão e Domínio de Negócios](https://www.google.com/search?q=docs/core/VISION_AND_DOMAIN.md) - A transição de transações reativas para projeção de compromissos (Bills).
2. [Arquitetura e Organização](https://www.google.com/search?q=docs/core/ARCHITECTURE.md) - Feature-Sliced Design e a separação de domínios.
3. [Modelagem de Dados e Invariante Contábil](https://www.google.com/search?q=docs/core/DATA_MODEL.md) - Como o dinheiro é protegido por vetores e o saldo é calculado dinamicamente.
4. [Estratégia de UI/UX](https://www.google.com/search?q=docs/core/UI_UX_STRATEGY.md) - Como a interface sobrevive a alta densidade de dados sem travar o navegador.

### Architecture Decision Records (ADRs)

As defesas técnicas para as abordagens não convencionais do sistema:

* [ADR 001: Separação entre Transaction e Movement (Padrão Ledger)](https://www.google.com/search?q=docs/decisions/001-double-entry-accounting.md)
* [ADR 002: Motor Genérico de Drafts e Commit Transacional](https://www.google.com/search?q=docs/decisions/002-optimistic-draft-engine.md)
* [ADR 003: Validação Dinâmica e Extensibilidade via Badges](https://www.google.com/search?q=docs/decisions/003-dynamic-schema-registry.md)
* [ADR 004: Adaptive UI e Padrão Container/Presenter](https://www.google.com/search?q=docs/decisions/004-adaptive-ui.md)

---

## 🚀 Principais Destaques Técnicos

* **Motor de Rascunhos Otimistas (Draft Engine):** Uma infraestrutura agnóstica (`PendingChange<T>`) que permite a edição, criação e exclusão massiva de transações em memória. O commit é feito em lote, reduzindo o *round-trip* de rede a zero durante o planejamento financeiro do usuário.
* **Validação por *Badges* (Strategy + Registry):** Formulários complexos não usam um objeto global inflado. Regras de validação e comportamentos de banco de dados são injetados dinamicamente no schema de validação conforme a necessidade da transação.
* **Interface Adaptativa:** Quebra o padrão de "responsividade CSS", entregando árvores de renderização distintas para Desktop (Tabelas Densas) e Mobile (Gestos em Lista), mantendo a lógica unificada em um padrão Container/Presenter.

## ⚙️ Como executar o projeto localmente

1. Clone este repositório:
```bash
git clone https://github.com/MintoJazz/finance-tracker.git
cd finance-tracker

```


2. Instale as dependências:
```bash
npm install

```


3. Configure o banco de dados:
* Crie um arquivo `.env` na raiz do projeto contendo a variável `DATABASE_URL` apontando para o seu PostgreSQL.
* Execute as *migrations* do Prisma:


```bash
npx prisma db push

```


4. Inicie o servidor de desenvolvimento:
```bash
npm run dev

```


A aplicação estará disponível em `http://localhost:3000`.

---

*Para informações sobre o futuro do sistema e extração de microsserviços (como o Módulo de Lista de Compras), consulte o **[Roadmap](/docs/ROADMAP.md)**.*