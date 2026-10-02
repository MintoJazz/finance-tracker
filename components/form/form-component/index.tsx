"use client"

import type { ReactNode } from "react"
import type { FieldValues, SubmitErrorHandler, UseFormReturn } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { FormContent } from "./content"
import { FormRoot } from "./root"

export interface FormProps<T extends FieldValues> {
  id: string
  submitText?: string
  autoComplete?: string
  /**
   * Substitui o botão de submit padrão por um footer customizado.
   * Ao utilizar, inclua um botão com `type="submit"` e `form={id}`.
   */
  footer?: ReactNode
  children: ReactNode
  form: UseFormReturn<T>
  className?: string
  contentClassName?: string
  onError?: SubmitErrorHandler<T>
  onSubmit: (form: T) => void
}

/** Formulário pronto: Root + Content + botão de submit */
export function Form<T extends FieldValues>({
  id,
  form,
  onSubmit,
  onError,
  children,
  className,
  contentClassName,
  submitText = "Salvar",
  autoComplete,
  footer,
}: FormProps<T>) {
  return (
    <FormRoot
      form={form}
      onSubmit={onSubmit}
      onError={onError}
      id={id}
      autoComplete={autoComplete}
      className={cn("gap-4", className)}
    >
      <FormContent className={contentClassName}>{children}</FormContent>
      {footer !== undefined ? (
        footer
      ) : (
        <Button type="submit" form={id}>
          {submitText}
        </Button>
      )}
    </FormRoot>
  )
}