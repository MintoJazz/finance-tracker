"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useWizard, wizardFormId } from "../core"

export interface WizardBackProps extends React.ComponentProps<typeof Button> {
  children?: React.ReactNode
}

export function WizardBack({
  children = "Voltar",
  variant = "outline",
  disabled,
  className,
  ...props
}: WizardBackProps) {
  const { isFirst, isSubmitting, back } = useWizard()

  return (
    <Button
      type="button"
      variant={variant}
      onClick={back}
      disabled={disabled ?? (isFirst || isSubmitting)}
      className={className}
      {...props}
    >
      {children}
    </Button>
  )
}

export interface WizardNextProps extends React.ComponentProps<typeof Button> {
  children?: React.ReactNode
  submitText?: string
}

export function WizardNext({
  children,
  submitText,
  variant = "default",
  disabled,
  className,
  ...props
}: WizardNextProps) {
  const { step, isLast, isSubmitting, next, instanceId } = useWizard()
  const hasForm = "fields" in step && Boolean(step.fields)

  const defaultLabel = step.submitText ?? submitText ?? (isLast ? "Concluir" : "Continuar")

  return (
    <Button
      type={hasForm ? "submit" : "button"}
      form={hasForm ? wizardFormId(step.id, instanceId) : undefined}
      onClick={hasForm ? undefined : () => next()}
      disabled={disabled ?? isSubmitting}
      variant={variant}
      className={className}
      {...props}
    >
      {isSubmitting ? (
        <span className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Processando...
        </span>
      ) : (
        children ?? defaultLabel
      )}
    </Button>
  )
}

export interface WizardActionsProps extends React.ComponentProps<"div"> {
  /** Exibe o botão de voltar no rodapé (padrão: false, pois a navegação fica no cabeçalho/progresso) */
  showBack?: boolean
  backProps?: WizardBackProps
  nextProps?: WizardNextProps
}

export function WizardActions({
  className,
  showBack = false,
  backProps,
  nextProps,
  ...props
}: WizardActionsProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 w-full",
        showBack ? "justify-between" : "justify-end",
        className
      )}
      {...props}
    >
      {showBack && <WizardBack {...backProps} />}
      <WizardNext
        className={cn(!showBack && "w-full", nextProps?.className)}
        {...nextProps}
      />
    </div>
  )
}
