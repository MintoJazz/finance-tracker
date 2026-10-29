import type { WizardStep } from "@/components/wizard"
import type { SignupFormType } from "@/modules/auth/models/signup.schema"

import { accountStep, accountStepSchema } from "./account.step"
import { profileStep, profileStepSchema } from "./profile.step"
import { reviewStep } from "./review.step"

export { accountStep, accountStepSchema } from "./account.step"
export { profileStep, profileStepSchema } from "./profile.step"
export { reviewStep } from "./review.step"

export const signupSteps: WizardStep<SignupFormType>[] = [
  accountStep,
  profileStep,
  reviewStep,
]
