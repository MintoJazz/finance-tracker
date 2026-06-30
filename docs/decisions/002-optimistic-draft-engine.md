# ADR 002: Motor Genérico de Rascunhos (Drafts) e Commit em Massa

**Status:** Aceito
**Domínio:** UX / Gerenciamento de Estado / Infraestrutura

## 1. Problema

A interface de planejamento financeiro (*Planner*) exige que o usuário realize processos de conciliação massivos — como alterar o status, editar valores ou apagar múltiplas transações sequencialmente.

A abordagem CRUD tradicional dita que cada alteração na interface deve disparar uma requisição HTTP correspondente (ex: `PATCH /transactions/1`). Em cenários de alta densidade, isso gera três problemas críticos:

1. **Gargalo de Rede:** Múltiplas requisições concorrentes causam latência, travando a interface com estados de carregamento (spinners).
2. **Poluição do Banco de Dados:** O usuário pode criar, editar e excluir uma mesma transação em um intervalo de poucos minutos durante o seu planejamento. Enviar esses estados efêmeros para o banco de dados onera o servidor sem valor contábil agregado.
3. **Inconsistência Transacional:** Se uma requisição no meio de um lote falhar por problemas de conectividade, o usuário ficará com um estado financeiro parcialmente atualizado e inconsistente.

## 2. Decisão

Foi decidido abandonar as requisições atômicas em tempo real e implementar um padrão de **Optimistic UI em Lote**.

Para isso, foi construído um Motor de Rascunhos (*Draft Engine*) agnóstico de domínio no cliente, tipado através de *Generics* no TypeScript. As mutações ficam retidas em memória até que o usuário execute a confirmação (*Commit*), enviando um único lote contendo as diferenças (*Diff*) para ser resolvido em uma transação ACID no banco de dados.

## 3. Evidências e Implementação

O coração desta abstração reside na definição de tipos genéricos da infraestrutura (`types/changes.ts`):

```typescript
export type WithId = { id: number }
export type Action = "add" | "edit" | "remove"

export type PendingChange<T extends WithId> = {
    action: Action,
    domain?: T | Partial<T>,
    original?: T
}

export type Drafts<T extends WithId> = Record<number, PendingChange<T>>

```

* **Agnóstico:** O motor não sabe o que é uma `Transaction`. Ele exige apenas que a entidade possua um identificador (`<T extends WithId>`), tornando-se reutilizável.
* **Smart Diff:** O campo `original?: T` permite que a interface compare a edição em tempo real. Se o usuário alterar uma entidade e depois revertê-la ao valor original na interface, o motor cancela silenciosamente o rascunho, limpando a fila antes do envio.
* **Transação ACID:** No backend (Server Action `persistDrafts`), o vetor inteiro de mutações é executado via `prisma.$transaction`. Se o passo 4 de 10 falhar, tudo é revertido, protegendo a integridade contábil.

## 4. Motivação

A escolha por uma arquitetura em lote resolve os três gargalos listados no problema:

* **UX Ininterrupta:** O usuário interage com uma fluidez absoluta (Zero Latency), pois está mutando apenas objetos no React.
* **Proteção do Banco:** O banco de dados nunca recebe "ruído" de planejamento; ele processa apenas a intenção final confirmada do usuário.
* **Platform Engineering:** Ao construir esse motor usando *Generics*, o esforço de engenharia já está pago para o futuro. Quando as funcionalidades de `Bills` (Contas a Pagar) ou `Buckets` exigirem edições em lote, a mesma infraestrutura será conectada com custo zero de implementação complexa.

## 5. Trade-offs (Consequências)

### Benefícios

* **Performance Drástica:** Redução de dezenas de *round-trips* de rede para apenas um.
* **Consistência de Estado:** Garantia de que processos de conciliação financeira complexos nunca sejam interrompidos no meio do caminho (Tudo ou Nada).

### Custos Aceitos

* **Risco de Volatilidade (Perda de Dados):** Se o usuário fechar a aba do navegador acidentalmente antes de clicar em "Salvar", as conciliações em rascunho são perdidas. *(Mitigação planejada no Roadmap: Hidratação de rascunhos via `localStorage` e *Service Workers*).*
* **Complexidade no Frontend:** Manter as chaves, os merges de entidades parciais e a limpeza de rascunhos no ecossistema do React eleva significativamente a complexidade da camada de estado do cliente.

## 6. Alternativas Descartadas

* **Auto-Save via Debounce:** Rejeitado. Embora resolvesse o problema da lentidão, salvar dados passivamente remove o controle da mão do usuário. Na contabilidade, o usuário precisa estar ciente e confirmar ativamente que seu planejamento está pronto para virar execução financeira.