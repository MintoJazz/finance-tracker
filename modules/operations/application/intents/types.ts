import type { z } from "zod"
import type { OperationDraft } from "../../models/operation-input.schema"
import type { StepDefinition } from "../steps/types"
import type { IntentSummary } from "../summary/types"

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
  /** Predicado puro opcional sobre os dados preenchidos para liberar a oferta */
  readonly when?: (data: Partial<TData>) => boolean
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
  readonly summary?: IntentSummary
}

