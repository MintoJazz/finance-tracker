"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoginFormType, LoginSchema } from "@/modules/identity/core/schemas/login.schema"
import type { LoginViewInput, LoginViewProps } from "./types"
import { onLogin } from "../../actions/login.action"

export function useLoginView(input?: LoginViewInput): LoginViewProps {
    const form = useForm<LoginFormType>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const onSubmit = async (data: LoginFormType) => onLogin(data)

    return {
        form,
        onSubmit,
    }
}