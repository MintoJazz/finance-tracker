"use client"

import * as React from "react"
import { useState } from "react"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import type { WizardProps } from "./types"
import { Wizard } from "./wizard"
import { WizardActions } from "./wizard-actions"
import { WizardProgress } from "./wizard-progress"
import { WizardStepContent } from "./wizard-step-content"
import { WizardStepper } from "./wizard-stepper"

export interface WizardSheetProps<TData = any> extends WizardProps<TData> {
  /** Elemento que dispara a abertura do Sheet (opcional se controlado por `open`) */
  trigger?: React.ReactNode
  /** Controle de abertura do Sheet (modo controlado) */
  open?: boolean
  /** Callback para alteração do estado de abertura */
  onOpenChange?: (open: boolean) => void
  /** Título principal exibido no cabeçalho do Sheet */
  title?: React.ReactNode
  /** Descrição geral exibida abaixo do título do Sheet */
  description?: React.ReactNode
  /** Lado da tela de onde o Sheet desliza (padrão: "right") */
  side?: "top" | "right" | "bottom" | "left"
  /** Classes adicionais para o container do SheetContent (ex: "sm:max-w-lg", "sm:max-w-xl") */
  contentClassName?: string
  /** Exibe a barra de progresso no topo (padrão: true) */
  showProgress?: boolean
  /** Exibe o stepper com indicadores de etapas (padrão: true) */
  showStepper?: boolean
}

/**
 * Componente pronto para renderizar um fluxo Wizard dentro de uma gaveta lateral (Sheet),
 * utilizando as peças componíveis do Wizard (WizardProgress, WizardStepContent e WizardActions no SheetFooter).
 */
export function WizardSheet<TData = any>({
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  title,
  description,
  side = "right",
  contentClassName,
  showProgress = true,
  showStepper = true,
  steps,
  initialData,
  initialStepId,
  stepId,
  onStepChange,
  onComplete,
  onChange,
  pruneInactive,
  className,
  children,
}: WizardSheetProps<TData>) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen

  const handleOpenChange = (nextOpen: boolean) => {
    if (isControlled) {
      setControlledOpen?.(nextOpen)
    } else {
      setInternalOpen(nextOpen)
    }
  }

  const handleComplete = async (data: TData) => {
    await onComplete(data)
    handleOpenChange(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && <SheetTrigger render={trigger as any} />}
      <SheetContent
        side={side}
        className={cn(
          "flex flex-col gap-0 p-0 sm:max-w-lg md:max-w-xl overflow-hidden",
          contentClassName
        )}
      >
        <Wizard<TData>
          steps={steps}
          initialData={initialData}
          initialStepId={initialStepId}
          stepId={stepId}
          onStepChange={onStepChange}
          onComplete={handleComplete}
          onClose={() => handleOpenChange(false)}
          onChange={onChange}
          pruneInactive={pruneInactive}
          className={cn("flex min-h-0 flex-1 flex-col", className)}
        >
          {(context) => (
            <>
              {/* Cabeçalho com Título e Progresso */}
              <SheetHeader className="border-b border-border p-6 pb-4 space-y-3">
                {title && <SheetTitle className="text-lg font-semibold">{title}</SheetTitle>}
                {description && (
                  <SheetDescription className="text-xs text-muted-foreground">
                    {description}
                  </SheetDescription>
                )}
                {showProgress && <WizardProgress />}
              </SheetHeader>

              {/* Área com Scroll Independente contendo Stepper e Campos */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {showStepper && <WizardStepper variant="compact" />}
                {children ? (
                  typeof children === "function" ? (
                    children(context)
                  ) : (
                    children
                  )
                ) : (
                  <WizardStepContent />
                )}
              </div>

              {/* Footer Fixo do Sheet com os Botões de Ação */}
              <SheetFooter className="border-t border-border p-4 mt-auto">
                <WizardActions />
              </SheetFooter>
            </>
          )}
        </Wizard>
      </SheetContent>
    </Sheet>
  )
}
