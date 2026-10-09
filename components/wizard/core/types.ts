import type { ComponentType, MutableRefObject, ReactNode } from "react"
import type { FieldValues } from "react-hook-form"
import type { z } from "zod"
import type { FieldLayoutProps } from "@/components/form/field-layouts"
import type { FormField } from "@/types/form.types"

export interface WizardStepBase<TData> {
  id: string
  title: string
  description?: string
  submitText?: string
  /** Condição para o passo estar ativo com base nos dados atuais */
  when?: (data: Partial<TData>) => boolean
}

export interface FieldsStep<
  TData,
  TSchema extends z.ZodType<FieldValues, any, any> = z.ZodType<FieldValues, any, any>,
  TContext = void,
> extends WizardStepBase<TData> {
  schema: TSchema
  fields: FormField<
    z.infer<TSchema> extends FieldValues ? z.infer<TSchema> : FieldValues,
    TContext
  >[]
  context?: TContext
  /** Layout padrão para os campos deste passo */
  layout?: ComponentType<FieldLayoutProps>
  component?: never
}

export interface CustomStepProps<TData> {
  data: Partial<TData>
  onNext: (patch?: Partial<TData>) => void | Promise<void>
  onBack: () => void
  onUpdate: (patch: Partial<TData>) => void
  goTo: (stepId: string) => void
  isFirst: boolean
  isLast: boolean
  isSubmitting?: boolean
}

export interface CustomStep<TData> extends WizardStepBase<TData> {
  component: ComponentType<CustomStepProps<TData>>
  schema?: never
  fields?: never
  context?: never
}

export type WizardStep<TData> =
  | FieldsStep<TData, any, any>
  | CustomStep<TData>

export interface WizardContextValue<TData> {
  /** Dados acumulados até o momento */
  data: Partial<TData>
  /** Passos atualmente ativos (filtrados por `when`) */
  steps: WizardStep<TData>[]
  /** Todos os passos declarados */
  allSteps: WizardStep<TData>[]
  /** Passo ativo atual */
  step: WizardStep<TData>
  /** Índice do passo atual dentro dos passos ativos (0-based) */
  index: number
  /** Indica se está no primeiro passo ativo */
  isFirst: boolean
  /** Indica se está no último passo ativo */
  isLast: boolean
  /** Progresso em porcentagem (0 a 100) */
  progress: number
  /** Indica se a ação de finalização (`onComplete`) está em andamento */
  isSubmitting: boolean
  /** Lista de ids dos passos já concluídos */
  completedStepIds: string[]
  /** Referência para captura síncrona do rascunho de formulário ativo */
  draftRef: MutableRefObject<(() => any) | null>
  /** Callback opcional de fechamento (ex: fechar modal/sheet no primeiro passo) */
  onClose?: () => void
  /** Callback opcional customizado para voltar */
  onBack?: () => void
  /** Avança para o próximo passo, mesclando dados opcionais */
  next: (patch?: Partial<TData>) => Promise<void> | void
  /** Retorna para o passo ativo anterior */
  back: () => void
  /** Navega diretamente para um passo ativo específico */
  goTo: (stepId: string) => void
  /** Atualiza dados sem avançar de passo */
  update: (patch: Partial<TData>) => void
}

export interface WizardProps<TData> {
  /** Definição de todos os passos do formulário */
  steps: WizardStep<TData>[]
  /** Dados iniciais do formulário */
  initialData?: Partial<TData>
  /** ID do passo inicial */
  initialStepId?: string
  /** ID do passo atual em modo controlado */
  stepId?: string
  /** Callback para alteração do passo em modo controlado (ex: sincronização com URL) */
  onStepChange?: (stepId: string) => void
  /** Callback executado ao concluir todos os passos com os dados finais */
  onComplete: (data: TData) => void | Promise<void>
  /** Callback opcional de fechamento do fluxo (ex: fechar modal/drawer) */
  onClose?: () => void
  /** Callback customizado para ação de voltar */
  onBack?: () => void
  /** Callback executado a cada alteração de dados ou de passo (útil para persistência) */
  onChange?: (state: { data: Partial<TData>; stepId: string }) => void
  /** Se `true` (padrão), remove os dados de passos que foram desativados antes de concluir */
  pruneInactive?: boolean
  className?: string
  children?:
    | ReactNode
    | ((context: WizardContextValue<TData>) => ReactNode)
}
