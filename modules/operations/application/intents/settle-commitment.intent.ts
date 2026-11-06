import { SettleCommitmentSliceSchema } from "../../models/intents/settle-commitment.schema"
import type { OperationIntentKey } from "../../models/operation-input.schema"
import { settleCommitmentSelectStep } from "../steps/intents/settle-commitment.steps"
import { settleCommitmentSummary } from "./summaries/settle-commitment.summary"
import type { IntentDefinition } from "./types"

export const settleCommitmentIntent = {
  key: "DEMO_SETTLE",
  schema: SettleCommitmentSliceSchema,
  addSteps: [settleCommitmentSelectStep],
  removeSteps: ["base.category", "base.subcategory"],
  excludes: ["DEMO_INSTALLMENTS", "CREATE_CATEGORY", "CREATE_SUBCATEGORY"],
  requires: [],
  offer: {
    at: ["base.entry", "intent.settle.select"],
    label: "Quitar compromisso",
    description:
      "Liquida uma obrigação já existente (remove Categoria/Subcategoria e exclui Parcelamento).",
    icon: "CalendarClock",
  },
  summary: settleCommitmentSummary,
} as const satisfies IntentDefinition<OperationIntentKey>

