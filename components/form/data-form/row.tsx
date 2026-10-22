"use client"

import type { ComponentType } from "react"
import { useFormContext, type FieldValues } from "react-hook-form"
import type { FieldLayoutProps } from "@/components/form/field-layouts"
import { ControlledField } from "@/components/form/controlled-field"
import type { FormFieldRow } from "@/types/form.types"
import { cn } from "@/lib/utils"

export interface DataFormRowProps<
  TForm extends FieldValues = FieldValues,
  TContext = void,
> {
  row: FormFieldRow<TForm, TContext>
  context?: TContext
  layout?: ComponentType<FieldLayoutProps>
}

export function DataFormRow<
  TForm extends FieldValues = FieldValues,
  TContext = void,
>({
  row,
  context,
  layout,
}: DataFormRowProps<TForm, TContext>) {
  const { watch } = useFormContext<TForm>()
  const currentValues = watch()

  // Se a linha inteira estiver oculta dinamicamente
  if (row.hidden?.(currentValues, context as TContext)) {
    return null
  }

  // Identifica campos visíveis para adaptar dinamicamente o número de colunas do grid
  const visibleFields = row.row.filter(
    (field) => !field.hidden?.(currentValues, context as TContext)
  )

  if (visibleFields.length === 0) {
    return null
  }

  const gridColsClass =
    visibleFields.length === 1
      ? "grid-cols-1"
      : visibleFields.length === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : visibleFields.length === 3
          ? "grid-cols-1 sm:grid-cols-3"
          : "grid-cols-1 sm:grid-cols-4"

  return (
    <div className={cn("grid gap-4 items-start", gridColsClass, row.className)}>
      {row.row.map((field) => (
        <ControlledField
          key={field.name}
          {...field}
          layout={field.layout ?? layout}
          context={context}
        />
      ))}
    </div>
  )
}
