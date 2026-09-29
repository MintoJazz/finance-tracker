"use client"

import Link from "next/link"
import { FieldDescription } from "@/components/ui/field"
import { LoginForm } from "@/modules/identity/ui/components/login-form"
import { LoginViewProps } from "./types"

export function LoginView({ form, onSubmit }: LoginViewProps) {
    return (
        <>
            <FieldDescription className="-mt-4 text-center">
                Don&apos;t have an account? <Link href="/signup">Sign up</Link>
            </FieldDescription>

            <LoginForm form={form} onSubmit={onSubmit} />
        </>
    )
}