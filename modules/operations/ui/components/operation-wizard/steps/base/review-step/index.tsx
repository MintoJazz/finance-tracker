import type { WizardStep } from "@/components/wizard"
import type { OperationDraft } from "@/modules/operations/models/operation-input.schema"
import type { StepViews } from "@/modules/operations/ui/components/operation-wizard/types"
import { OperationReviewCard } from "./review-card"

export const reviewWizardStep: WizardStep<OperationDraft> = {
  id: "base.review",
  title: "Revisão da Operação",
  description: "Confira o resumo antes de confirmar o lançamento.",
  submitText: "Confirmar operação",
  component: OperationReviewCard,
}

export const reviewStepViews = {
  desktop: reviewWizardStep,
  mobile: [reviewWizardStep],
} satisfies StepViews<OperationDraft>
