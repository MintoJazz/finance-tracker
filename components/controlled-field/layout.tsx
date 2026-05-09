import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface FieldLayoutProps {
    label: string
    children: ReactNode
    error?: string
    className?: string
}

export function FieldLayout({ label, error, children, className }: FieldLayoutProps) {
    return (
        <Field data-invalid={!!error} className={cn("flex flex-col gap-2", className)}>
            <FieldLabel>{label}</FieldLabel>
            {children}
            <FieldError errors={error ? [{ message: error }] : []} />
        </Field>
    )
}