# ADR 004: Adaptive UI e Padrão Container/Presenter

**Status:** Aceito
**Domínio:** Frontend / Renderização / UX

## 1. Problema

Aplicativos financeiros, especialmente na visão de "Planejador" (*Planner*), exigem a exibição e manipulação de uma altíssima densidade de dados. O usuário precisa visualizar, filtrar e editar simultaneamente datas, valores, origens, destinos, categorias e status de consolidação.

A abordagem padrão da indústria web para lidar com múltiplos dispositivos é o **Design Responsivo**, que utiliza *Media Queries* (CSS) para ocultar ou empilhar elementos visuais conforme a tela encolhe. Em interfaces de alta complexidade, essa abordagem gera três problemas graves:

1. **UX Comprometida:** Ocultar colunas de uma tabela financeira em telas menores remove contexto vital do usuário. O celular exige um paradigma de interação completamente diferente (listas em vez de tabelas, *swipes* em vez de cliques do mouse, *bottom sheets* em vez de modais densos).
2. **Código Espaguete:** Tentar acomodar as interações complexas de desktop e a navegação *touch-first* de mobile em um único componente React resulta em arquivos massivos, repletos de condicionais de renderização e lógicas de interface conflitantes.
3. **Sobrecarga de Renderização:** Elementos pesados exclusivos do desktop (como tabelas do *TanStack Table*) ainda são baixados e avaliados no navegador móvel, mesmo que ocultos pelo CSS (`display: none`), impactando a performance.

## 2. Decisão

Foi decidido abandonar a responsividade estrita em favor de uma **Adaptive UI** (Interface Adaptativa). O sistema entrega componentes visuais fisicamente distintos para Mobile e Desktop.

Para evitar a violação do princípio *DRY* (Don't Repeat Yourself) e a duplicação de regras de negócio, a arquitetura visual foi acoplada ao padrão **Container/Presenter Component** (também conhecido como *Smart/Dumb Components*).

## 3. Evidências e Implementação

A arquitetura reflete essa decisão na estruturação da camada de visualização dentro do diretório `app/` (ex: `app/(planner)/_views/` e `app/buckets/_views/`):

* **Page (`page.tsx`):** Ponto de entrada burro. Repassa parâmetros de rota.
* **Container Lógico (`view-container.tsx`):** O componente "Smart". Ele não possui marcação HTML de layout. Sua única responsabilidade é invocar os orquestradores (como `useBucketView`), consolidar o *fetch* de dados, gerenciar o estado complexo (filtros) e a instância do motor genérico de *Drafts*.
* **Presenters Visuais (`-desktop-view.tsx` e `-mobile-view.tsx`):** Componentes "Dumb". Eles recebem o estado e as funções de mutação exclusivamente via *props*. O componente desktop renderiza uma tabela densa e interativa, enquanto o mobile renderiza uma lista focada em interações de toque.

## 4. Motivação

O principal motivador desta escolha é a **Liberdade de Design sem Concessões (Uncompromised UX)**.

Ao separar as árvores de renderização, elimina-se o conflito entre o que o desktop precisa e o que o mobile suporta. Se um erro de layout ocorrer na complexa tabela de conciliação do desktop, o risco de quebrar a jornada do usuário no celular é rigorosamente zero.

Além disso, a extração de toda a lógica para o *Container/Hook* estabelece uma **Fonte Única da Verdade** no frontend. Regras de paginação, motores de rascunho e chamadas de Server Actions rodam apenas uma vez, tornando o comportamento do sistema extremamente previsível e altamente testável (é possível testar as regras de negócio da tela isolando o *Hook*, sem montar a árvore do DOM).

## 5. Trade-offs (Consequências)

### Benefícios

* **Performance no Mobile:** O cliente faz o download apenas das lógicas de layout relevantes para o seu dispositivo.
* **Manutenibilidade:** Separação clara entre quem "busca e processa" (Container) e quem "exibe" (Presenter).

### Custos Aceitos

* **Boilerplate e Prop Drilling:** A criação de um *Container* para intermediar a comunicação exige repassar a mesma interface de *props* duas vezes (uma para o Desktop, outra para o Mobile), o que torna a adição de um novo botão na interface ligeiramente mais verbosa.
* **Complexidade de Refatoração:** Sendo a decisão arquitetural mais recente do projeto, os contratos de repasse de *props* ainda estão em fase de maturidade, exigindo cuidado para que os *Presenters* não comecem a acumular lógicas acidentalmente.

## 6. Alternativas Descartadas

* **Componentes Responsivos Dinâmicos (Tailwind `hidden md:block`):** Descartado para interações complexas devido à poluição do código e à incapacidade de alterar fundamentalmente o paradigma de interação (Tabela vs. Cartões de Deslizar).