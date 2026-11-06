import type { OperationDraft } from "../../models/operation-input.schema"
import type {
  OperationNature,
  OperationSeed,
} from "../../models/operation-seed.schema"

export interface StepResolutionContext<TIntentKey extends string = string> {
  nature?: OperationNature
  intents: readonly TIntentKey[]
  seed?: OperationSeed
  data?: Partial<OperationDraft>
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
  /** Predicado puro declarativo baseado nos dados preenchidos (ex.: fatura quando custódia = CREDIT) */
  readonly when?: (data: Partial<OperationDraft>) => boolean
}

