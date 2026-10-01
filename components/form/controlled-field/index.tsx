"use client"

import { useId } from "react"
import { useController, useFormContext, type FieldValues } from "react-hook-form"
import { Slot } from "@radix-ui/react-slot"
import { VerticalLayout } from "@/components/form/field-layouts"
import type { FormField } from "@/types/form.types"

interface ControlledFieldProps<
  TForm extends FieldValues = FieldValues,
  TContext = void,
> extends FormField<TForm, TContext> {
  context?: TContext
}

export function ControlledField<
  TForm extends FieldValues = FieldValues,
  TContext = void,
>({
  name,
  label,
  description,
  className,
  hidden,
  layout,
  render,
  children,
  context,
}: ControlledFieldProps<TForm, TContext>) {
  const generatedId = useId()
  const { control, watch } = useFormContext<TForm>()
  const { field, fieldState } = useController({ name, control })

  // NOTA: Campos ocultados via `hidden` retornam null, porém o `useController` acima
  // já registrou o campo no React Hook Form. Portanto, o campo permanece no estado do form
  // e é validado pelo schema (ex: Zod), podendo travar a submissão se for obrigatório.
  if (hidden) {
    const currentValues = watch()
    if (hidden(currentValues, context as TContext)) return null
  }

  /**
   * Saída de emergência que substitui layout e controle por completo.
   * Deve ser utilizada apenas como exceção quando os layouts ou slots padrões não atendem.
   */
  if (render) {
    return <>{render({ field, fieldState, context: context as TContext })}</>
  }

  const resolvedChildren =
    typeof children === "function"
      ? children(context as TContext, field)
      : children

  const LayoutComponent = layout ?? VerticalLayout

  return (
    <LayoutComponent
      id={generatedId}
      label={label}
      description={description}
      error={fieldState.error}
      className={className}
    >
      <Slot id={generatedId} aria-invalid={!!fieldState.error} {...field}>
        {resolvedChildren}
      </Slot>
    </LayoutComponent>
  )
}