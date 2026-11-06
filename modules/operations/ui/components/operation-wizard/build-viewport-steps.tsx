import type { WizardStep } from "@/components/wizard"
import type { StepDefinition } from "@/modules/operations/application/steps/types"
import type { OperationDraft } from "@/modules/operations/models/operation-input.schema"
import type { ViewPort } from "@/types/adaptive.types"
import { STEP_VIEWS_CATALOG } from "./steps"
import type { StepViewsCatalog } from "./types"

/**
 * Converte de forma declarativa a lista de etapas lógicas ativas (`resolveSteps`)
 * nas telas concretas (`WizardStep[]`) do viewport selecionado (Desktop ou Mobile).
 */
export function buildViewportSteps<TStep extends StepDefinition<any>>(
  logicalSteps: readonly TStep[],
  viewport: ViewPort,
  viewsCatalog: StepViewsCatalog<string, OperationDraft> = STEP_VIEWS_CATALOG
): WizardStep<OperationDraft>[] {
  const result: WizardStep<OperationDraft>[] = []

  for (const logicalStep of logicalSteps) {
    const viewEntry = viewsCatalog[logicalStep.id]
    if (!viewEntry) continue

    if (viewport === "desktop") {
      if (viewEntry.desktop) {
        result.push(viewEntry.desktop)
      }
    } else {
      result.push(...viewEntry.mobile)
    }
  }

  return result
}
