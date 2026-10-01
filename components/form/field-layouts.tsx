"use client"

import type { ReactNode } from "react"
import type { FieldError as RHFFieldError } from "react-hook-form"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { cn } from "@/lib/utils"

export interface FieldLayoutProps {
  id: string
  label?: ReactNode
  description?: ReactNode
  error?: RHFFieldError
  className?: string
  children: ReactNode
}

/**
 * Layout vertical padrão do formulário.
 * Reproduz o markup e estilo visual padrão com label acima, controle e erro centralizado.
 */
export function VerticalLayout({
  id,
  label,
  description,
  error,
  className,
  children,
}: FieldLayoutProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
      {children}
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError className="text-center" errors={[error]} />
    </div>
  )
}

/**
 * Layout horizontal com label à esquerda e controle/erro alinhados à direita.
 */
export function HorizontalLayout({
  id,
  label,
  description,
  error,
  className,
  children,
}: FieldLayoutProps) {
  return (
    <Field orientation="horizontal" className={cn("items-start gap-4", className)}>
      {label && (
        <FieldLabel
          htmlFor={id}
          className="w-32 shrink-0 pt-2 text-right sm:w-40 sm:text-right"
        >
          {label}
        </FieldLabel>
      )}
      <FieldContent className="w-full">
        {children}
        {description && <FieldDescription>{description}</FieldDescription>}
        <FieldError errors={[error]} />
      </FieldContent>
    </Field>
  )
}

/**
 * Layout com controle à esquerda e label à direita (ideal para Checkbox, Switch e Toggle).
 */
export function ControlFirstLayout({
  id,
  label,
  description,
  error,
  className,
  children,
}: FieldLayoutProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center gap-2">
        {children}
        {label && (
          <FieldLabel htmlFor={id} className="cursor-pointer font-normal">
            {label}
          </FieldLabel>
        )}
      </div>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={[error]} />
    </div>
  )
}
