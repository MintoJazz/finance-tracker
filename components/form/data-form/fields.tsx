"use client"

import type { ComponentType } from "react"
import type { FieldValues } from "react-hook-form"
import type { FieldLayoutProps } from "@/components/form/field-layouts"
import { ControlledField } from "@/components/form/controlled-field"
import type { FormField } from "@/types/form.types"

export interface DataFormFieldsProps<
  TForm extends FieldValues = FieldValues,
  TContext = void,
> {
  fields: FormField<TForm, TContext>[]
  context?: TContext
  layout?: ComponentType<FieldLayoutProps>
}

export function DataFormFields<
  TForm extends FieldValues = FieldValues,
  TContext = void,
>({
  fields,
  context,
  layout,
}: DataFormFieldsProps<TForm, TContext>) {
  return (
    <>
      {fields.map((f) => (
        <ControlledField
          key={f.name}
          {...f}
          layout={f.layout ?? layout}
          context={context}
        />
      ))}
    </>
  )
}
