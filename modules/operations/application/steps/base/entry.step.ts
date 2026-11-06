import { STEP_ORDER } from "../order"
import type { StepDefinition } from "../types"

export const entryBaseStep = {
  id: "base.entry",
  order: STEP_ORDER.ENTRY,
  source: "BASE",
  fields: ["nature"],
  skipWhen: ({ seed }) => seed?.nature !== undefined,
} as const satisfies StepDefinition

