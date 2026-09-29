import { LoginFormType } from "@/modules/identity/core/schemas/login.schema"
import type { UseFormReturn } from "react-hook-form"

export interface LoginFormProps {
    form: UseFormReturn<LoginFormType>
    onSubmit: (data: LoginFormType) => void
}