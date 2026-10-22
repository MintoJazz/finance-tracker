import type { ComponentType, ReactNode } from "react"
import type {
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  Path,
  SubmitErrorHandler,
  UseFormReturn,
} from "react-hook-form"
import type { FieldLayoutProps } from "@/components/form/field-layouts"

export interface FormFieldItem<
  TForm extends FieldValues = FieldValues,
  TContext = void,
> {
  name: Path<TForm>
  label?: ReactNode
  description?: ReactNode
  className?: string
  /** Componente de layout customizado para este campo específico */
  layout?: ComponentType<FieldLayoutProps>
  /** Formata o valor para exibição em telas de revisão e tabelas (não utilizado pelo DataForm) */
  display?: (value: unknown) => string
  /** Oculta o campo dinamicamente com base nos valores atuais do form ou no contexto */
  hidden?: (values: TForm, context: TContext) => boolean
  /** Saída de emergência que substitui layout e controle por completo */
  render?: (props: {
    field: ControllerRenderProps<TForm, Path<TForm>>
    fieldState: ControllerFieldState
    context: TContext
  }) => ReactNode
  /** Aceita JSX direto (injetado via Slot) ou função com (context, field) */
  children?:
    | ReactNode
    | ((
        context: TContext,
        field: ControllerRenderProps<TForm, Path<TForm>>
      ) => ReactNode)
}

export interface FormFieldRow<
  TForm extends FieldValues = FieldValues,
  TContext = void,
> {
  /** Lista de campos a serem exibidos nesta linha */
  row: FormFieldItem<TForm, TContext>[]
  /** Classes CSS adicionais para o container do grid da linha */
  className?: string
  /** Oculta a linha inteira dinamicamente com base nos valores atuais do form ou no contexto */
  hidden?: (values: TForm, context: TContext) => boolean
}

export type FormField<
  TForm extends FieldValues = FieldValues,
  TContext = void,
> = FormFieldItem<TForm, TContext> | FormFieldRow<TForm, TContext>

/**
 * Type guard para verificar se um campo é uma linha de campos (FormFieldRow).
 */
export function isFormFieldRow<
  TForm extends FieldValues = FieldValues,
  TContext = void,
>(
  field: FormField<TForm, TContext>
): field is FormFieldRow<TForm, TContext> {
  return (
    typeof field === "object" &&
    field !== null &&
    "row" in field &&
    Array.isArray((field as FormFieldRow<TForm, TContext>).row)
  )
}

/**
 * Achata uma lista de campos (desaninhando FormFieldRow em uma lista linear de FormFieldItem).
 */
export function flattenFormFields<
  TForm extends FieldValues = FieldValues,
  TContext = void,
>(
  fields: FormField<TForm, TContext>[]
): FormFieldItem<TForm, TContext>[] {
  return fields.flatMap((item) =>
    isFormFieldRow(item) ? item.row : [item]
  )
}

type ContextProp<TContext> = [TContext] extends [void]
  ? { context?: TContext }
  : { context: TContext }

export type DataFormProps<
  TForm extends FieldValues = FieldValues,
  TContext = void,
> = ContextProp<TContext> & {
  id: string
  form: UseFormReturn<TForm>
  fields:
    | FormField<TForm, TContext>[]
    | ((context: TContext) => FormField<TForm, TContext>[])
  /** Layout padrão aplicado aos campos do formulário (padrão: VerticalLayout) */
  layout?: ComponentType<FieldLayoutProps>
  submitText?: string
  /** Substitui o botão de submit padrão por um rodapé customizado */
  footer?: ReactNode
  className?: string
  contentClassName?: string
  /** Permite injetar elementos extras dentro do formulário, abaixo dos fields */
  children?: ReactNode
  onError?: SubmitErrorHandler<TForm>
  onSubmit: (data: TForm) => void
}