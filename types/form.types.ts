import type { ReactNode } from "react"
import type {
  ControllerRenderProps,
  FieldValues,
  Path,
  SubmitErrorHandler,
  UseFormReturn,
} from "react-hook-form"

export interface FormField<
  TForm extends FieldValues = FieldValues,
  TContext = void,
> {
  name: Path<TForm>
  label?: string
  className?: string
  /** Oculta o campo dinamicamente com base nos valores atuais do form ou no contexto */
  hidden?: (values: TForm, context: TContext) => boolean
  /** Aceita JSX direto (injetado via Slot) ou função com (context, field) */
  children:
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
  submitText?: string
  className?: string
  contentClassName?: string
  /** Permite injetar elementos extras dentro do formulário, abaixo dos fields */
  children?: ReactNode
  onError?: SubmitErrorHandler<TForm>
  onSubmit: (data: TForm) => void
}