# ADR 003: Validação Dinâmica e Extensibilidade via Badges (Schema Registry)

**Status:** Aceito

**Domínio:** Formulários / Validação / Engenharia de Domínio

## 1. Problema

Em sistemas financeiros, o formulário de "Nova Transação" tende a se tornar um God Object (Objeto Deus). Uma despesa simples exige apenas valor, data e categoria. No entanto, uma transferência exige conta de origem e destino; uma despesa reembolsável exige o pagador original; uma fatura exige regras de parcelamento.

Se todas essas regras fossem acomodadas em um modelo estático de validação, o resultado seria um único esquema colossal do Zod (`z.object`) repleto de campos opcionais (`.optional()`) e ramificações condicionais de interface (`if/else`).

Essa abordagem cria dois problemas:

1. **Frágil e Engessado:** Adicionar um novo comportamento no futuro obriga o desenvolvedor a modificar o núcleo (*core*) de criação de transações, quebrando o princípio de responsabilidade única.
2. **Lixo de Dados (Data Leakage):** Se o usuário preencher os dados de "Parcelamento" e depois ocultar essa seção na interface, os dados ocultos podem acabar sendo submetidos acidentalmente, poluindo o banco de dados.

## 2. Decisão

Foi decidido abandonar o modelo de formulário monolítico em favor de uma **Validação Dinâmica Dirigida por Badges**, utilizando o padrão **Schema Registry** (Registro de Esquemas) em conjunto com o padrão **Strategy** para construção das entidades.

O sistema divide as complexidades da transação em blocos independentes (*Badges*). A transação só passa a "conhecer" regras complexas se a respectiva *badge* for ativada pelo usuário em tempo de execução.

## 3. Evidências e Implementação

A arquitetura resolve esse problema em três etapas rigorosas no código (`features/transaction/form/` e `mappers/`):

* **O Dicionário de Esquemas (`SCHEMA_REGISTRY`):** Cada anomalia financeira (ex: `addDestination`, `addOrigin`) possui seu próprio subesquema isolado.
* **Injeção de Contexto (`superRefine`):** O esquema base da transação recebe a lista de `activeBadges`. Utilizando o `superRefine` do Zod, o sistema itera dinamicamente sobre as *badges* ativadas, resgata as regras de validação no *Registry* correspondente e força a validação daquele bloco, injetando os erros nos caminhos corretos da interface.
* **Higiene via Transformação (`.transform()`):** Ao final da validação do Zod, uma função de transformação limpa ativamente o payload. Qualquer dado residual pertencente a uma *badge* que não esteja na lista de ativas é descartado antes de chegar à Server Action.
* **Estratégias de Domínio (`BADGE_MODIFYERS`):** No backend, o mapeamento para o Prisma não usa condicionais gigantes. Um registro de modificadores atua como o padrão *Strategy*. Se a transação possui a badge `addDestination`, o construtor delega a matemática financeira para a função pura `toTransfer()`, que calcula a inversão de sinais e gera os múltiplos `Movements`.

## 4. Motivação

O objetivo primário é o respeito absoluto ao **Princípio Aberto/Fechado (Open/Closed Principle)**.

O núcleo de transações agora está fechado para modificações, mas aberto para extensão infinita. Quando o módulo futuro de "Recorrência de Bills" for implementado, a equipe precisará apenas:

1. Criar o subesquema de recorrência.
2. Registrá-lo no `SCHEMA_REGISTRY` e criar a regra no `BADGE_MODIFYERS`.
3. Adicionar o componente visual da *Badge*.

O código base da transação permanece intocado, e a interface se adapta progressivamente à complexidade desejada pelo usuário (reduzindo a carga cognitiva). Adicionalmente, resolve conflitos de estado na interface através de exclusão mútua nos eventos de clique das *badges*, impedindo que estados inválidos sequer iniciem o ciclo de validação.

## 5. Trade-offs (Consequências)

### Benefícios

* **Modularidade Extrema:** Regras financeiras não se contaminam. O cálculo de estorno não polui o arquivo de despesas simples.
* **Segurança de Dados:** O banco de dados está fisicamente impedido de receber campos fantasmas originados de interações de UI incompletas.

### Custos Aceitos

* **Tipagem Avançada:** Tipar corretamente objetos mesclados dinamicamente em tempo de execução exige utilitários avançados do TypeScript (como `Partial` aninhados e interseções dinâmicas), aumentando a curva de aprendizado para novos desenvolvedores na equipe.
* **Indireção do Fluxo de Código:** Para entender como uma transferência é salva, o desenvolvedor precisa pular do fluxo principal para o *Registry* e depois para os *Modifiers*, perdendo a leitura processual e linear do código.

## 6. Alternativas Descartadas

* **Renderização Condicional Pura (React State):** Controlar a obrigatoriedade dos campos apenas ocultando-os visualmente (`active && <Input />`) foi rejeitado por não oferecer garantia de segurança contra submissões de dados forjadas (o backend ainda precisaria do God Object para validar).