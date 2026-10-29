import { LoginFormType } from "@/modules/auth/models/login.schema"
import type { UseFormReturn } from "react-hook-form"

export interface LoginFormProps {
    form: UseFormReturn<LoginFormType>
    onSubmit: (data: LoginFormType) => void
}