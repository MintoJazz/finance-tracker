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

export interface FormField<
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

type ContextProp<TContext> = [TContext] extends [void]
  ? { context?: TContext }
  : { context: TContext }

export type DataFormProps<
  TForm extends FieldValues = FieldValues,
  TContext = void,
> = ContextProp<TContext> & {
  id: string
  form: UseFormReturn<TForm>
  fields: FormField<TForm, TContext>[]
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