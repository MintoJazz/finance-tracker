"use client"

import type { ReactNode } from "react"
import {
  FormProvider,
  type FieldValues,
  type SubmitErrorHandler,
  type UseFormReturn,
} from "react-hook-form"

import { cn } from "@/lib/utils"

interface FormRootProps<T extends FieldValues> {
  form: UseFormReturn<T>
  onSubmit: (data: T) => void
  onError?: SubmitErrorHandler<T>
  id?: string
  className?: string
  children: ReactNode
}

export function FormRoot<T extends FieldValues>({
  form,
  onSubmit,
  onError,
  id,
  className,
  children,
}: FormRootProps<T>) {
  return (
    <FormProvider {...form}>
      <form
        id={id}
        method="post"
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className={cn("flex flex-col", className)}
      >
        {children}
      </form>
    </FormProvider>
  )
}