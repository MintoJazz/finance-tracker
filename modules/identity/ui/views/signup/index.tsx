"use client"

import Link from "next/link"
import { GalleryVerticalEnd } from "lucide-react"
import { FieldDescription } from "@/components/ui/field"
import { SignupAvatarStep, SignupForm } from "@/modules/identity/ui/components/signup-form"
import { AuthSocial } from "@/modules/identity/ui/components/auth-social"
import type { SignupViewProps } from "./types"

export function SignupView({
    stage,
    onSubmitSignup,
    onFinishAvatar,
    initialData,
}: SignupViewProps) {
    if (stage === "avatar") {
        return (
            <div className="flex flex-col gap-4">
                <SignupAvatarStep onComplete={onFinishAvatar} />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2 text-center">
                <Link
                    href="/"
                    className="flex flex-col items-center gap-2 font-medium"
                >
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <GalleryVerticalEnd className="size-5" />
                    </div>
                    <span className="sr-only">Finance Tracker</span>
                </Link>
                <h1 className="text-xl font-bold tracking-tight">Crie sua Conta</h1>
                <FieldDescription className="text-center text-xs">
                    Já possui uma conta?{" "}
                    <Link href="/login" className="font-medium underline underline-offset-2 hover:text-foreground">
                        Entrar
                    </Link>
                </FieldDescription>
            </div>

            <SignupForm onSubmit={onSubmitSignup} initialData={initialData} />

            <AuthSocial mode="signup" />
        </div>
    )
}