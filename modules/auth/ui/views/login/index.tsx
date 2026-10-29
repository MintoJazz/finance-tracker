"use client"

import Link from "next/link"
import { GalleryVerticalEnd } from "lucide-react"
import { FieldDescription } from "@/components/ui/field"
import { LoginForm } from "@/modules/auth/ui/components/login-form"
import { AuthSocial } from "@/modules/auth/ui/components/auth-social"
import type { LoginViewProps } from "./types"

export function LoginView({ form, onSubmit }: LoginViewProps) {
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
                <h1 className="text-xl font-bold tracking-tight">Bem-vindo ao Finance Tracker</h1>
                <FieldDescription className="text-center text-xs">
                    Não possui uma conta?{" "}
                    <Link href="/signup" className="font-medium underline underline-offset-2 hover:text-foreground">
                        Cadastre-se
                    </Link>
                </FieldDescription>
            </div>

            <LoginForm form={form} onSubmit={onSubmit} />

            <AuthSocial mode="login" />
        </div>
    )
}