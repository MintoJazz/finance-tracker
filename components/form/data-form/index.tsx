"use client"

import type { FieldValues } from "react-hook-form"
import { Form } from "@/components/form/form-component"
import type { DataFormProps } from "@/types/form.types"
import { DataFormFields } from "./fields"

export function DataForm<
  TForm extends FieldValues,
  TContext = void,
>({
  id,
  form,
  fields,
  context,
  submitText,
  footer,
  layout,
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
      footer={footer}
      className={className}
      contentClassName={contentClassName}
    >
      <DataFormFields fields={fields} context={context} layout={layout} />
      {children}
    </Form>
  )
}

export { DataForm as ObjectForm }
export { DataFormFields }