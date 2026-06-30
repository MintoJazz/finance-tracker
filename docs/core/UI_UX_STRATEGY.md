# FinTracker: Estratégia de UI/UX e Gerenciamento de Estado

## 1. O Desafio da Alta Densidade de Dados

Sistemas de planejamento financeiro (*Planners*) possuem uma característica inerente: a **altíssima densidade de dados**. O usuário precisa analisar múltiplas colunas (status, data, categoria, valor, meio de pagamento) simultaneamente para tomar decisões de conciliação.

A abordagem tradicional do desenvolvimento web para lidar com diferentes tamanhos de tela é o **Design Responsivo** (utilizando *Media Queries* no CSS para ocultar ou empilhar colunas). No entanto, para interfaces financeiras complexas, o design responsivo puramente visual falha em dois aspectos críticos:

1. **Degradação da Experiência do Usuário (UX):** Tentar espremer uma tabela rica (Data Table) em uma tela de celular resulta em rolagem horizontal frustrante ou cartões ilegíveis.
2. **Sobrecarga de Renderização (Performance):** O navegador do celular ainda precisa baixar e processar o JavaScript e o HTML de tabelas pesadas, mesmo que elas estejam ocultas via CSS (`display: none`).

Para resolver esse problema sem comprometer o fluxo de negócios, o FinTracker abandonou a responsividade tradicional em favor do padrão **Adaptive UI**.

---

## 2. Adaptive UI e o Padrão Container/Presenter

O sistema entrega interfaces estruturalmente diferentes dependendo do ambiente, construídas especificamente para as limitações e vantagens de cada formato. No desktop, o usuário tem acesso a tabelas amplas e atalhos de teclado. No mobile, a interação é baseada em listas de toque (*touch-first*) e ações em gavetas (*bottom sheets*).

Para não violar o princípio *DRY* (Don't Repeat Yourself) e não duplicar a lógica de negócios, a arquitetura de renderização adota uma variação do padrão **Container/Presenter Component**:

### A Hierarquia de Renderização

1. **A Página (`page.tsx`):** O ponto de entrada da rota. Sua única responsabilidade é avaliar o contexto e repassar os parâmetros da URL.
2. **O Container Lógico (`_views/*-view-container.tsx`):** O "cérebro" da tela. Este componente invoca os *hooks* principais (ex: `useBucketView`). Ele é responsável por:
* Fazer o *fetch* de dados do servidor.
* Gerenciar o estado complexo da interface (como filtros e paginação).
* Orquestrar o motor de rascunhos (*Drafts*).


3. **As Views de Apresentação (`-desktop-view.tsx` e `-mobile-view.tsx`):** Componentes estúpidos (*Dumb Components*). Eles não possuem estado próprio de negócio. Apenas recebem os dados do *Container* via *props* e os renderizam na estrutura visual mais otimizada para o dispositivo.

Essa separação garante uma **Fonte Única da Verdade (Single Source of Truth)** no frontend. Um bug na regra de paginação é corrigido apenas no *Container*, refletindo simultaneamente no mobile e no desktop, sem risco de quebrar o layout isolado de cada um.

---

## 3. Optimistic UI: O Motor de Rascunhos (Drafts)

O processo de conciliação financeira exige que o usuário altere o status de dezenas de transações seguidas. Se a interface disparasse uma requisição HTTP para cada clique — bloqueando a tela com ícones de carregamento (*spinners*) —, a UX seria insuportável.

Para criar uma experiência fluida, o sistema abstrai a latência da rede através de um **Gerenciamento de Estado Otimista em Lote**, apelidado de Motor de *Drafts*.

### A Mecânica Type-Safe de Mutações

Através da tipagem genérica centralizada (`PendingChange<T>`), o sistema permite que o usuário adicione, edite ou remova transações localmente.

* As mudanças são acumuladas apenas na memória do cliente (estado do React).
* A interface exibe uma barra de notificação avisando sobre "Alterações Pendentes".
* O motor possui inteligência de *Diff* (comparação): se o usuário edita uma transação e depois a reverte para o valor original, o motor remove silenciosamente essa edição da fila de *Drafts*, mantendo o estado da aplicação enxuto.

Apenas quando o usuário clica em "Salvar", o lote inteiro (*batch*) é despachado para uma *Server Action*, onde é resolvido dentro de uma única transação ACID no Prisma, garantindo consistência no banco de dados e fluidez ininterrupta na interface.

---

### *Próximo Passo Recomendado*

*Leia a seção de Architecture Decision Records (ADRs) para entender a fundo as motivações técnicas, os trade-offs e os blocos de código que dão sustentação aos padrões descritos até aqui.*