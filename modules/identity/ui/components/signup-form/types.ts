import type { SignupFormType } from "@/modules/identity/core/schemas/signup.schema"

export interface SignupFormProps {
  initialData?: Partial<SignupFormType>
  onSubmit: (data: SignupFormType) => void | Promise<void>
  onClose?: () => void
}