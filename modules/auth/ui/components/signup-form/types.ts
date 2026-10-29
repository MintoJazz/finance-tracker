import type { SignupFormType } from "@/modules/auth/models/signup.schema"

export interface SignupFormProps {
  initialData?: Partial<SignupFormType>
  onSubmit: (data: SignupFormType) => void | Promise<void>
  onClose?: () => void
}