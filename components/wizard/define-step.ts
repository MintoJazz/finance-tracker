import type { ComponentType } from "react"
import type { FieldValues } from "react-hook-form"
import type { z } from "zod"
import type { FieldLayoutProps } from "@/components/form/field-layouts"
import type { FormField } from "@/types/form.types"
import type { CustomStep, CustomStepProps, FieldsStep } from "./types"

export interface DefineStepOptions<
  TSchema extends z.ZodType<FieldValues, any, any>,
  TData = any,
  TContext = void,
> {
  id: string
  title: string
  description?: string
  schema: TSchema
  fields: FormField<
    z.infer<TSchema> extends FieldValues ? z.infer<TSchema> : FieldValues,
    TContext
  >[]
  context?: TContext
  when?: (data: Partial<TData>) => boolean
  layout?: ComponentType<FieldLayoutProps>
  submitText?: string
}

/**
 * Helper tipado para definir um passo baseado em formulário Zod e DataForm.
 * Infere a tipagem do schema e compatibiliza com o Wizard global.
 */
export function defineStep<
  TSchema extends z.ZodType<FieldValues, any, any>,
  TData = any,
  TContext = void,
>(
  options: DefineStepOptions<TSchema, TData, TContext>
): FieldsStep<TData, TSchema, TContext> {
  return {
    id: options.id,
    title: options.title,
    description: options.description,
    schema: options.schema,
    fields: options.fields as any,
    context: options.context,
    when: options.when,
    layout: options.layout,
    submitText: options.submitText,
  }
}

export interface DefineCustomStepOptions<TData> {
  id: string
  title: string
  description?: string
  submitText?: string
  component: ComponentType<CustomStepProps<TData>>
  when?: (data: Partial<TData>) => boolean
}

/**
 * Helper tipado para definir um passo customizado no Wizard (ex: revisão, pagamentos, upload).
 */
export function defineCustomStep<TData = any>(
  options: DefineCustomStepOptions<TData>
): CustomStep<TData> {
  return {
    id: options.id,
    title: options.title,
    description: options.description,
    submitText: options.submitText,
    component: options.component,
    when: options.when,
  }
}
