import type {
  OperationDraft,
  OperationIntentKey,
} from "../../models/operation-input.schema"
import type {
  CustodyBalanceType,
  OperationNature,
} from "../../models/operation-seed.schema"

/**
 * Ponteiro simbólico para uma entidade já existente no banco de dados (selecionada na UI)
 * ou para a saída de um nó anterior do próprio grafo de execução (DAG).
 */
export type EntityRef =
  | {
      readonly kind: "existing"
      readonly id: number
    }
  | {
      readonly kind: "node"
      /** ID do nó produtor no grafo (ex.: "intent.create_category") */
      readonly nodeId: string
      /**
       * Porta de saída opcional quando um mesmo nó produz mais de uma entidade
       * (ex.: futuramente em cobranças: port: "receivable" | "payable")
       */
      readonly port?: string
    }

/**
 * Quadro-Negro ("Blackboard") de ponteiros semânticos da operação.
 * O Base inicializa os ponteiros e cada Intent ativa pode ler ou redirecionar os ponteiros.
 */
export interface OperationPointers {
  /** Conta onde o dinheiro/limite é movimentado (Carteira, Cartão ou Reserva) */
  custody: EntityRef | null
  /** Categoria raiz (existente via base.categoryId ou nó "intent.create_category") */
  categoryRoot: EntityRef | null
  /** Contraparte contábil final da operação (subcategoria ou categoria raiz) */
  counterpart: EntityRef | null
  /** Lançamento principal gerado pela operação base */
  mainEntry: EntityRef | null
  /** Slots nomeados abertos para expansões futuras (ex.: árvore de cobranças) */
  extras: Record<string, EntityRef>
}

export interface CreateCategoryBalanceAction {
  readonly type: "CREATE_CATEGORY_BALANCE"
  readonly name: string
  readonly color: string | null
  readonly icon: string | null
  /** null para categoria raiz; EntityRef para subcategoria */
  readonly parent: EntityRef | null
}

export interface CreateDirectEntryAction {
  readonly type: "CREATE_DIRECT_ENTRY"
  readonly nature: OperationNature
  readonly custody: EntityRef | null
  readonly custodyType: CustodyBalanceType
  readonly counterpart: EntityRef | null
  readonly amountCents: number
  readonly description: string
  readonly dueDate: string
  readonly competanceDate: string | null
}

export type OperationNodeAction =
  | CreateCategoryBalanceAction
  | CreateDirectEntryAction

export interface OperationPlanNode<
  TIntentKey extends string = OperationIntentKey,
> {
  /** ID único do nó no grafo (ex.: "intent.create_category", "base.direct_entry") */
  readonly id: string
  /** Origem declarativa do nó */
  readonly source: "BASE" | TIntentKey
  /** Ordem numérica de referência (STEP_ORDER) usada para desempate e exibição */
  readonly order: number
  /** ID da etapa lógica no Wizard para navegação "clique para editar" no Resumo */
  readonly stepId?: string
  /** Dependências diretas extraídas automaticamente das EntityRefs da action */
  readonly dependsOn: readonly string[]
  /** Comando de domínio a ser executado */
  readonly action: OperationNodeAction
}

export interface OperationExecutionPlan<
  TIntentKey extends string = OperationIntentKey,
> {
  /** Lista de nós ordenada topologicamente (dependências sempre vêm antes) */
  readonly nodes: readonly OperationPlanNode<TIntentKey>[]
  /** Estado final dos ponteiros semânticos após todas as intents contribuírem */
  readonly pointers: Readonly<OperationPointers>
  /** Intenções ativas sanitizadas que participaram da compilação */
  readonly activeIntents: readonly TIntentKey[]
}

export interface IntentPlanNodeInput<
  TIntentKey extends string = OperationIntentKey,
> {
  readonly id: string
  readonly source: "BASE" | TIntentKey
  readonly order: number
  readonly stepId?: string
  readonly action: OperationNodeAction
}

export interface IntentPlanContext<
  TData = OperationDraft,
  TIntentKey extends string = OperationIntentKey,
> {
  readonly payload: Partial<TData>
  readonly activeIntents: readonly TIntentKey[]
  readonly pointers: OperationPointers
  addNode: (node: IntentPlanNodeInput<TIntentKey>) => EntityRef
}

export interface ResolvedNodeOutput {
  /** ID primário criado no banco (ex.: balance.id ou entry.id) */
  readonly id: number
  /** Portas nomeadas opcionais (ex.: { receivable: 60, payable: 61 }) */
  readonly ports?: Readonly<Record<string, number>>
}

export interface OperationExecutionResult {
  /** Mapa nodeId -> IDs reais gerados no banco de dados */
  readonly nodes: Readonly<Record<string, ResolvedNodeOutput>>
  /** Atalhos semânticos resolvidos para consumo imediato da UI / caller */
  readonly resolved: {
    readonly mainEntryId: number | null
    readonly custodyBalanceId: number | null
    readonly categoryRootId: number | null
    readonly counterpartBalanceId: number | null
  }
}

