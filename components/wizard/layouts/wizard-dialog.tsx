"use client"

import * as React from "react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { WizardProps } from "../core"
import { Wizard, useWizard } from "../core"
import {
  WizardActions,
  WizardProgress,
  WizardStepContent,
  WizardStepper,
} from "../components"

export interface WizardDialogLayoutProps {
  /** Título exibido no cabeçalho do Dialog (ou passo atual se omitido) */
  title?: React.ReactNode
  /** Descrição exibida no cabeçalho */
  description?: React.ReactNode
  /** Exibe a barra de progresso no topo (padrão: true) */
  showProgress?: boolean
  /** Exibe o stepper compacto alternativo (padrão: false para evitar duplicação) */
  showStepper?: boolean
  /** Conteúdo opcional no lugar do WizardStepContent padrão */
  children?: React.ReactNode
  /** Classes adicionais para o wrapper interno */
  className?: string
  /** Conteúdo exibido acima dos botões de ação no rodapé (ex.: barra de pills) */
  footerExtra?: React.ReactNode
  /** Exibe o botão de voltar no rodapé */
  showBack?: boolean
  /** Substituição completa do rodapé */
  footer?: React.ReactNode
}

/**
 * Layout interno para Wizard em Dialog Desktop:
 * - Cabeçalho com título, descrição e barra de progresso
 * - Área de conteúdo com scroll suave
 * - Rodapé com DialogFooter oficial, fundo destacado e botões de Voltar / Continuar
 */
export function WizardDialogLayout({
  title,
  description,
  showProgress = true,
  showStepper = false,
  children,
  className,
  footerExtra,
  showBack = true,
  footer,
}: WizardDialogLayoutProps) {
  const { step, index, steps } = useWizard()

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col gap-3", className)}>
      <div className="flex flex-col gap-2.5 border-b border-border/60 pb-3 pr-7">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-base font-semibold text-foreground leading-tight">
              {title ?? step.title}
            </div>
            {(description ?? step.description) && (
              <div className="text-xs text-muted-foreground mt-1">
                {description ?? step.description}
              </div>
            )}
          </div>
          <span className="text-[11px] font-medium text-muted-foreground shrink-0 rounded-md bg-muted/60 px-2 py-0.5">
            Etapa {index + 1} de {steps.length}
          </span>
        </div>

        {showProgress ? (
          <WizardProgress />
        ) : (
          showStepper && <WizardStepper variant="compact" />
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain py-1 pr-0.5">
        {children ?? <WizardStepContent />}
      </div>

      {footer ?? (
        <DialogFooter className="-mx-5 -mb-5 mt-auto flex flex-col sm:flex-col gap-2.5 border-t border-border/60 bg-muted/30 px-5 py-3 rounded-b-xl">
          {footerExtra && <div className="w-full">{footerExtra}</div>}
          <div className="flex items-center justify-between w-full gap-3">
            <WizardActions showBack={showBack} />
          </div>
        </DialogFooter>
      )}
    </div>
  )
}

export interface WizardDialogProps<TData = any> extends WizardProps<TData> {
  /** Controle de abertura do Dialog */
  open?: boolean
  /** Callback para alteração do estado de abertura */
  onOpenChange?: (open: boolean) => void
  /** Callback executado após a conclusão da animação de abertura/fechamento */
  onOpenChangeComplete?: (open: boolean) => void
  /** Título principal exibido no cabeçalho do Dialog */
  title?: React.ReactNode
  /** Descrição geral exibida abaixo do título */
  description?: React.ReactNode
  /** Classes adicionais para o DialogContent */
  contentClassName?: string
  /** Exibe a barra de progresso no topo (padrão: true) */
  showProgress?: boolean
  /** Exibe o stepper com indicadores de etapas (padrão: true) */
  showStepper?: boolean
}

export function WizardDialog<TData = any>({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onOpenChangeComplete,
  title,
  description,
  contentClassName,
  showProgress = true,
  showStepper = false,
  steps,
  initialData,
  initialStepId,
  stepId,
  onStepChange,
  onComplete,
  onClose,
  onChange,
  pruneInactive = true,
  className,
  children,
}: WizardDialogProps<TData>) {
  const isControlled = controlledOpen !== undefined
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = isControlled ? controlledOpen : internalOpen

  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen)
    }
    controlledOnOpenChange?.(newOpen)
    if (!newOpen) {
      onClose?.()
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleOpenChange}
      onOpenChangeComplete={onOpenChangeComplete}
    >
      <DialogContent
        className={cn(
          "sm:max-w-xl max-h-[88dvh] flex flex-col overflow-hidden p-5 gap-0",
          contentClassName
        )}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>
            {typeof title === "string" ? title : "Nova Operação"}
          </DialogTitle>
          <DialogDescription>
            {typeof description === "string"
              ? description
              : "Preencha as etapas da operação financeira."}
          </DialogDescription>
        </DialogHeader>

        <Wizard<TData>
          steps={steps}
          initialData={initialData}
          initialStepId={initialStepId}
          stepId={stepId}
          onStepChange={onStepChange}
          onComplete={onComplete}
          onClose={() => handleOpenChange(false)}
          onChange={onChange}
          pruneInactive={pruneInactive}
          className={cn("flex min-h-0 flex-1 flex-col", className)}
        >
          {(context) =>
            children ? (
              typeof children === "function" ? (
                children(context)
              ) : (
                children
              )
            ) : (
              <WizardDialogLayout
                title={title}
                description={description}
                showProgress={showProgress}
                showStepper={showStepper}
              />
            )
          }
        </Wizard>
      </DialogContent>
    </Dialog>
  )
}
