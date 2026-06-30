# FinTracker: Arquitetura e Organização de Código

## 1. O Problema da Arquitetura Horizontal

Projetos Next.js e React tradicionais costumam adotar uma organização horizontal baseada em responsabilidades técnicas (ex: diretórios massivos agrupando todos os `components/`, todos os `hooks/`, todos os `types/`).

Embora esse padrão seja útil em provas de conceito, ele falha miseravelmente em domínios complexos. À medida que o FinTracker cresceu para acomodar lógicas transacionais profundas, a arquitetura horizontal revelou seus problemas:

* **Baixa Coesão:** Alterar o comportamento de uma "Transação" exigia navegar por múltiplos diretórios globais desconexos.
* **Acoplamento Tecnológico:** As regras financeiras começaram a se misturar com detalhes de roteamento do framework.

Para resolver isso e preparar o terreno para a futura expansão do ecossistema, o projeto adotou um padrão de isolamento vertical.

---

## 2. Feature-Sliced Design (Vertical Slicing)

O repositório do FinTracker utiliza uma adaptação do **Feature-Sliced Design (FSD)**, também conhecido como **Vertical Slicing** ou *Screaming Architecture*. Em vez de agrupar o código por "o que ele é no React", o código é agrupado por "o que ele faz no negócio".

### A Pasta `features/` (O Coração do Sistema)

Toda a complexidade de domínio vive isolada no diretório raiz `features/`. Cada módulo (como `features/transaction`) é completamente autossuficiente e coeso, contendo:

* **`server/`**: Operações de mutação (`"use server"`) e interações diretas com o Prisma (ORM), blindando o banco de dados.
* **`form/`**: Schemas Zod complexos (utilizando `superRefine` e *Registry* de *Badges*) que governam as anomalias daquele domínio.
* **`mappers/`**: Padrões *Strategy* que transformam intenções da interface de usuário em vetores matemáticos para o banco de dados.

### Alta Coesão e Baixo Acoplamento

Este fatiamento garante que toda a lógica necessária para o motor financeiro existir e ser modificado esteja no mesmo lugar. Se um bug ocorrer no cálculo de uma transação, o engenheiro sabe exatamente onde procurá-lo, sem se perder em diretórios globais de utilitários.

---

## 3. Isolamento do Framework (Next.js como Delivery Mechanism)

Um princípio fundamental do FinTracker é tratar o Next.js estritamente como um **Mecanismo de Entrega** (*Delivery Mechanism*), e não como a arquitetura do sistema.

### O Papel Limitado do Diretório `app/`

O diretório de roteamento do Next.js (`app/`) é mantido o mais raso e estúpido possível. Ele atua apenas como uma camada orquestradora superficial:

1. **Páginas (`page.tsx`):** Avaliam parâmetros de rota e invocam componentes de infraestrutura (como os *View-Containers*).
2. **Servidor vs. Cliente:** O framework delega instantaneamente o estado pesado e as intenções de mutação (ex: *Drafts* de formulário) para a camada de `features/`, que não sabe nada sobre URLs ou SSR (*Server-Side Rendering*).
3. **UI Burra:** Os componentes de interface reaproveitáveis, construídos sobre o Shadcn UI e o Tailwind CSS, vivem em uma pasta global `components/ui/`, sem possuir qualquer conhecimento sobre transações ou orçamentos.

---

## 4. Prontidão para o Futuro: Microsserviços e API-First

Esta arquitetura não foi desenhada apenas por questões de higiene de código, mas sim como uma fundação para o **Roadmap do Ecossistema FinTracker**.

O planejamento prevê que novos domínios periféricos — como um organizador complexo de Lista de Compras, gerenciamento de despensa ou automações externas — se tornem aplicações (ou clientes) independentes.

Graças ao *Feature-Sliced Design* e à separação estrita da camada de rotas (`app/`), o monólito atual está pronto para ser fragmentado:

* As lógicas contidas em `features/` podem ser exportadas para atuar como *Route Handlers* (APIs REST/GraphQL) nativas dentro do próprio Next.js.
* O novo aplicativo de "Lista de Compras" poderá consumir esses *endpoints* para liquidar pagamentos via `Bills`, interagir com saldos de `Buckets` e registrar `Transactions`, sem que a equipe precise reescrever ou duplicar regras de consolidação financeira.

---

### *Próximo Passo Recomendado*

*Leia o documento `UI_UX_STRATEGY.md` para entender como a camada de apresentação consome essas regras de negócio entregando interações de altíssima performance através do motor de Drafts e do padrão Adaptive UI.*