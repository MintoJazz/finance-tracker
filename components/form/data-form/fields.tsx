"use client"

import type { ComponentType } from "react"
import type { FieldValues } from "react-hook-form"
import type { FieldLayoutProps } from "@/components/form/field-layouts"
import { ControlledField } from "@/components/form/controlled-field"
import { isFormFieldRow, type FormField } from "@/types/form.types"
import { DataFormRow } from "./row"

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
      {fields.map((f, index) => {
        if (isFormFieldRow(f)) {
          const rowKey =
            f.row.map((item) => item.name).join("-") || `row-${index}`

          return (
            <DataFormRow
              key={rowKey}
              row={f}
              context={context}
              layout={layout}
            />
          )
        }

        return (
          <ControlledField
            key={f.name}
            {...f}
            layout={f.layout ?? layout}
            context={context}
          />
        )
      })}
    </>
  )
}
