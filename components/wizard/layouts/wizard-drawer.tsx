"use client"

import * as React from "react"
import { useState } from "react"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer"
import { cn } from "@/lib/utils"
import type { WizardProps } from "../core"
import { Wizard, useWizard } from "../core"
import {
  WizardNavButton,
  WizardNext,
  WizardStepContent,
} from "../components"

export interface WizardDrawerLayoutProps {
  /** Callback opcional de fechamento para sobrescrever o do contexto */
  onClose?: () => void
  /** Classe CSS customizada para o contêiner interno */
  className?: string
  /** Conteúdo customizado opcional no corpo da etapa */
  children?: React.ReactNode
  /** Conteúdo exibido acima dos botões de ação no rodapé (ex.: barra de pills) */
  footerExtra?: React.ReactNode
  /** Exibe o botão de voltar no rodapé (padrão: true quando não for primeiro passo) */
  showBack?: boolean
  /** Substituição completa do rodapé */
  footer?: React.ReactNode
}

/**
 * Layout interno padronizado para Drawer Mobile com Wizard:
 * - Cabeçalho compacto (botão voltar/fechar + título + contador + barra de progresso segmentada)
 * - Área de conteúdo com scroll suave e confinamento de viewport
 * - Rodapé fixo com botões de voltar/continuar e área para pills de opções
 */
export function WizardDrawerLayout({
  onClose: propOnClose,
  className,
  children,
  footerExtra,
  showBack,
  footer,
}: WizardDrawerLayoutProps) {
  const { index, steps, step, isFirst, goTo, onClose: contextOnClose } = useWizard()
  const handleClose = propOnClose ?? contextOnClose

  const renderBack = showBack ?? !isFirst

  return (
    <div className={cn("flex flex-col min-h-0 flex-1", className)}>
      {/* Cabeçalho do Wizard: Linha de título e navegação + Barra de progresso abaixo */}
      <div className="flex shrink-0 flex-col gap-2 border-b border-border/50 pb-2.5 mb-2">
        {/* Linha 1: Botão Voltar/Fechar + Título do Passo + Indicador */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <WizardNavButton
              onClose={handleClose}
              className="size-7 p-0 shrink-0 text-muted-foreground hover:text-foreground"
            />
            <span className="text-sm font-semibold text-foreground truncate">
              {step.title}
            </span>
          </div>
          <span className="text-xs text-muted-foreground font-medium shrink-0">
            Passo {index + 1} de {steps.length}
          </span>
        </div>

        {/* Linha 2: Barra de progresso segmentada normal em largura total */}
        <ol className="flex items-center gap-1.5 w-full" aria-label="Progresso das etapas">
          {steps.map((s, i) => {
            const isCompleted = i < index
            const isCurrent = i === index

            return (
              <li key={s.id} className="flex-1 flex items-center">
                <button
                  type="button"
                  onClick={() => isCompleted && goTo(s.id)}
                  disabled={!isCompleted}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={`Passo ${i + 1}: ${s.title}`}
                  className={cn(
                    "h-1.5 w-full rounded-full transition-all duration-200 outline-none",
                    isCompleted &&
                      "bg-primary cursor-pointer hover:bg-primary/80 focus-visible:ring-2 focus-visible:ring-ring",
                    isCurrent && "bg-primary ring-2 ring-primary/20",
                    !isCompleted && !isCurrent && "bg-muted cursor-not-allowed opacity-60"
                  )}
                />
              </li>
            )
          })}
        </ol>
      </div>

      {/* Área de Conteúdo do Passo com Rolagem Suave */}
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain py-1">
        {children ?? <WizardStepContent />}
      </div>

      {/* Rodapé Fixo: Conteúdo extra (pills de opções) + Botão Continuar */}
      {footer ?? (
        <div className="shrink-0 pt-2.5 mt-auto border-t border-border/40 flex flex-col gap-2">
          {footerExtra}
          <WizardNext
            className={cn(
              "w-full",
              "h-9 text-xs font-semibold"
            )}
          />
        </div>
      )}
    </div>
  )
}

export interface WizardDrawerProps<TData = any> extends WizardProps<TData> {
  /** Controle de abertura do Drawer */
  open?: boolean
  /** Callback para alteração do estado de abertura */
  onOpenChange?: (open: boolean) => void
  /** Callback executado após a conclusão da animação de abertura/fechamento */
  onOpenChangeComplete?: (open: boolean) => void
  /** Título acessível do drawer (renderizado em sr-only se não houver cabeçalho customizado) */
  title?: string
  /** Descrição acessível do drawer */
  description?: string
  /** Classes CSS adicionais para o DrawerContent */
  contentClassName?: string
  /** Exibe a alça de arrasto do drawer (padrão: true) */
  showSwipeHandle?: boolean
}

/**
 * Layout unificado completo do Wizard para Drawer Mobile no padrão do projeto.
 * Encapsula Drawer, DrawerContent, Wizard e WizardDrawerLayout de forma declarativa.
 */
export function WizardDrawer<TData = any>({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onOpenChangeComplete,
  title,
  description,
  contentClassName,
  showSwipeHandle = true,
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
}: WizardDrawerProps<TData>) {
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

  const handleComplete = async (data: TData) => {
    await onComplete(data)
  }

  return (
    <Drawer
      open={isOpen}
      onOpenChange={handleOpenChange}
      onOpenChangeComplete={onOpenChangeComplete}
      showSwipeHandle={showSwipeHandle}
    >
      <DrawerContent
        className={cn(
          "data-[swipe-axis=y]:[--drawer-content-max-height:calc(100dvh-calc(var(--drawer-inset,0px)*2))] max-h-[calc(100dvh-calc(var(--drawer-inset,0px)*2))]",
          contentClassName
        )}
      >
        <DrawerTitle className="sr-only">{title ?? "Formulário em etapas"}</DrawerTitle>
        {description && (
          <DrawerDescription className="sr-only">{description}</DrawerDescription>
        )}
        <div className="flex flex-col min-h-0 flex-1 px-3.5 pt-1 pb-3">
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
            className={cn("flex flex-col min-h-0 flex-1", className)}
          >
            {(context) =>
              children ? (
                typeof children === "function" ? (
                  children(context)
                ) : (
                  children
                )
              ) : (
                <WizardDrawerLayout onClose={() => handleOpenChange(false)} />
              )
            }
          </Wizard>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
