"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/toast"
import type { SignupFormType } from "@/modules/auth/models/signup.schema"
import { onSignup } from "../../actions/signup.action"
import type { SignupStage, SignupViewInput, SignupViewProps } from "./types"

export function useSignupView(input?: SignupViewInput): SignupViewProps {
    const router = useRouter()
    const [stage, setStage] = useState<SignupStage>("signup")

    const onSubmitSignup = async (data: SignupFormType) => {
        const result = await onSignup(data)
        if (!result.success) {
            console.error("[useSignupView] Falha no cadastro:", result.error)
            toast.add({
                type: "error",
                title: "Falha ao cadastrar",
                description: result.error,
                priority: "high",
            })
            return
        }

        toast.add({
            type: "success",
            title: "Conta criada com sucesso!",
            description: "Agora você pode adicionar sua foto de perfil.",
        })

        setStage("avatar")
    }

    const onFinishAvatar = () => {
        const destination = input?.callbackUrl || "/"
        router.push(destination)
    }

    return {
        stage,
        onSubmitSignup,
        onFinishAvatar,
    }
}