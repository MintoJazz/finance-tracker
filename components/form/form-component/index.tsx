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
}: FormProps<T>) {
  return (
    <FormRoot
      form={form}
      onSubmit={onSubmit}
      onError={onError}
      id={id}
      className={cn("gap-4", className)}
    >
      <FormContent className={contentClassName}>{children}</FormContent>
      <Button type="submit" form={id}>
        {submitText}
      </Button>
    </FormRoot>
  )
}