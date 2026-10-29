import type { SignupFormType } from "@/modules/auth/models/signup.schema"

export interface SignupViewInput {
    callbackUrl?: string
}

export type SignupStage = "signup" | "avatar"

export interface SignupViewProps {
    stage: SignupStage
    initialData?: Partial<SignupFormType>
    onSubmitSignup: (data: SignupFormType) => Promise<void>
    onFinishAvatar: () => void
}