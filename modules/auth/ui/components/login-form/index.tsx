"use client"

import { Form, ControlledField } from "@/components/form"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import type { LoginFormProps } from "./types"

export function LoginForm({ form, onSubmit }: LoginFormProps) {
    return (
        <Form
            id="login-form"
            form={form}
            onSubmit={onSubmit}
            submitText="Login"
        >
            <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <ControlledField name="email">
                    <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        autoComplete="email"
                    />
                </ControlledField>
            </Field>

            <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <ControlledField name="password">
                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                    />
                </ControlledField>
            </Field>
        </Form>
    )
}