import type { z } from "zod"
import type { OperationDraft } from "../../models/operation-input.schema"
import type { OperationSeed } from "../../models/operation-seed.schema"
import type { IntentPlanContext } from "../plan/types"
import type {
  IntentPredicateContext,
  StepDefinition,
  StepValidationIssue,
} from "../steps/types"
import type { OperationLookupData } from "../summary/types"

export interface IntentInitialSliceContext {
  readonly seed: OperationSeed
  readonly lookups?: OperationLookupData
}

export interface IntentOffer<TData = OperationDraft> {
  /**
   * ID(s) da etapa lógica onde a pill desta intenção é oferecida.
   * Pode ser um único ID ou uma lista de IDs (ex.: oferecer também nas etapas que ela própria injeta).
   */
  readonly at: string | readonly string[]
  /** Rótulo curto exibido na pill horizontal */
  readonly label: string
  /** Descrição curta (tooltip / aria-label / inspector) */
  readonly description: string
  /** Nome opcional do ícone Lucide */
  readonly icon?: string
  /** Predicado puro opcional sobre os dados preenchidos e ponteiros para liberar a oferta */
  readonly when?: (
    data: Partial<TData>,
    ctx: IntentPredicateContext
  ) => boolean
}

export interface IntentDefinition<
  TIntentKey extends string = string,
  TStep extends StepDefinition<TIntentKey> = StepDefinition<TIntentKey>,
  TData = OperationDraft,
> {
  readonly key: TIntentKey
  readonly schema: z.ZodTypeAny
  readonly addSteps: readonly TStep[]
  readonly removeSteps: readonly string[]
  readonly excludes: readonly TIntentKey[]
  readonly requires: readonly TIntentKey[]
  readonly implies?: readonly TIntentKey[]
  readonly offer?: IntentOffer<TData>
  /**
   * Predicado puro para ativação automática da intenção (ex: quando categoryRoot não tem subcategorias filhas).
   * Avaliado no loop de ponto fixo do interpretador.
   */
  readonly autoActivateWhen?: (
    data: Partial<TData>,
    ctx: IntentPredicateContext
  ) => boolean
  /**
   * Contribui declarativamente para o Grafo de Execução (DAG) da operação,
   * adicionando nós e/ou redirecionando ponteiros do Quadro-Negro.
   * Alimenta simultaneamente a Revisão/Inspector (Frontend) e o Executor Transacional (Backend).
   */
  readonly plan?: (ctx: IntentPlanContext<TData, TIntentKey>) => void
  /** Fábrica declarativa do estado inicial da fatia desta intenção no rascunho */
  readonly initialSlice?: (
    ctx: IntentInitialSliceContext
  ) => Record<string, unknown>
  /** Validação pura contextual executada quando a intenção está ativa */
  readonly validate?: (data: Partial<TData>) => readonly StepValidationIssue[]
}

