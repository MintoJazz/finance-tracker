"use client"

import * as React from "react"

import {
  Wizard,
  WizardActions,
  WizardProgress,
  WizardStepContent,
  WizardStepHeader,
} from "@/components/wizard"
import type { SignupFormType } from "@/modules/auth/models/signup.schema"
import { signupSteps } from "./steps"
import type { SignupFormProps } from "./types"

export { signupSteps } from "./steps"
export { SignupAvatarStep } from "./steps/signup-avatar-step"

export function SignupForm({ onSubmit, initialData, onClose }: SignupFormProps) {
  return (
    <div className="w-full">
      <Wizard<SignupFormType>
        steps={signupSteps}
        initialData={initialData}
        onComplete={onSubmit}
        onClose={onClose}
        pruneInactive={true}
        className="flex flex-col gap-6"
      >
        <WizardProgress />
        <div className="space-y-4">
          <WizardStepHeader />
          <WizardStepContent />
        </div>
        <div>
          <WizardActions />
        </div>
      </Wizard>
    </div>
  )
}