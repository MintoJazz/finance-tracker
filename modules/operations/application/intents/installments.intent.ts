import { InstallmentsSliceSchema } from "../../models/intents/installments.schema"
import type { OperationIntentKey } from "../../models/operation-input.schema"
import { installmentsConfigStep } from "../steps/intents/installments.steps"
import { installmentsSummary } from "./summaries/installments.summary"
import type { IntentDefinition } from "./types"

export const installmentsIntent = {
  key: "DEMO_INSTALLMENTS",
  schema: InstallmentsSliceSchema,
  addSteps: [installmentsConfigStep],
  removeSteps: [],
  excludes: ["DEMO_SETTLE"],
  requires: [],
  offer: {
    at: ["base.details", "intent.installments.config"],
    label: "Parcelar",
    description:
      "Divide a operação em múltiplas parcelas periódicas (order 5000).",
    icon: "Layers",
  },
  summary: installmentsSummary,
} as const satisfies IntentDefinition<OperationIntentKey>

