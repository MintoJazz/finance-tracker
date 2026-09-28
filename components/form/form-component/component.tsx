"use client"

import type { ReactNode } from "react"
import type { FieldValues, SubmitErrorHandler, UseFormReturn } from "react-hook-form"

import { Button } from "@/components/ui/button"

import { FormContent } from "./content"
import { FormRoot } from "./root"

interface FormProps<T extends FieldValues> {
  id: string
  submitText?: string
  children: ReactNode
  form: UseFormReturn<T>
  onError?: SubmitErrorHandler<T>
  onSubmit: (form: T) => void
}

/** Formulário pronto: Root + Content + botão de submit */
export default function Form<T extends FieldValues>({
  id,
  form,
  onSubmit,
  onError,
  children,
  submitText = "Salvar",
}: FormProps<T>) {
  return (
    <FormRoot form={form} onSubmit={onSubmit} onError={onError} id={id} className="gap-4">
      <FormContent>{children}</FormContent>
      <Button type="submit" form={id}>
        {submitText}
      </Button>
    </FormRoot>
  )
}