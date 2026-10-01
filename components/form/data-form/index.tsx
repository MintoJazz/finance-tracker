"use client"

import type { FieldValues } from "react-hook-form"
import { ControlledField } from "@/components/form/controlled-field"
import { Form } from "@/components/form/form-component"
import type { DataFormProps } from "@/types/form.types"

export function DataForm<
  TForm extends FieldValues,
  TContext = void,
>({
  id,
  form,
  fields,
  context,
  submitText,
  className,
  contentClassName,
  children,
  onError,
  onSubmit,
}: DataFormProps<TForm, TContext>) {
  return (
    <Form
      id={id}
      form={form}
      onSubmit={onSubmit}
      onError={onError}
      submitText={submitText}
      className={className}
      contentClassName={contentClassName}
    >
      {fields.map((fieldDef) => (
        <ControlledField
          key={fieldDef.name}
          {...fieldDef}
          context={context}
        />
      ))}
      {children}
    </Form>
  )
}

export { DataForm as ObjectForm }