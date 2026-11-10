import type { OperationDraft } from "../../models/operation-input.schema"
import type {
  OperationNature,
  OperationSeed,
} from "../../models/operation-seed.schema"
import type { OperationPointers } from "../plan/types"
import type { OperationLookupData } from "../summary/types"

export interface IntentPredicateContext {
  readonly pointers: Readonly<OperationPointers>
  readonly lookups?: OperationLookupData
}

export interface StepResolutionContext<TIntentKey extends string = string> {
  nature?: OperationNature
  intents: readonly TIntentKey[]
  seed?: OperationSeed
  data?: Partial<OperationDraft>
  lookups?: OperationLookupData
  pointers?: Readonly<OperationPointers>
}

export interface StepValidationIssue {
  readonly path: readonly (string | number)[]
  readonly message: string
}

/**
 * Objeto estático que define uma Etapa Lógica no motor de operações.
 * Puro (sem React, sem Next, sem Prisma).
 */
export interface StepDefinition<TIntentKey extends string = string> {
  readonly id: string
  readonly order: number
  readonly source: "BASE" | TIntentKey
  readonly fields: readonly string[]
  /** Predicado puro para pular etapa já satisfeita por seed / ações */
  readonly skipWhen?: (ctx: StepResolutionContext<TIntentKey>) => boolean
  /** Predicado puro declarativo baseado nos dados preenchidos e ponteiros (ex.: fatura quando custódia = CREDIT) */
  readonly when?: (
    data: Partial<OperationDraft>,
    ctx: IntentPredicateContext
  ) => boolean
  /** Validação pura contextual executada quando a etapa está ativa no fluxo */
  readonly validate?: (
    data: Partial<OperationDraft>
  ) => readonly StepValidationIssue[]
}

