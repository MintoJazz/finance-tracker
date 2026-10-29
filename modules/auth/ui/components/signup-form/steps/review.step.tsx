import { ReviewStep, type WizardStep } from "@/components/wizard"
import type { SignupFormType } from "@/modules/auth/models/signup.schema"

export const reviewStep: WizardStep<SignupFormType> = {
  id: "review",
  title: "Revisão",
  description: "Confira seus dados antes de concluir o cadastro",
  submitText: "Criar Conta",
  component: ReviewStep,
}
