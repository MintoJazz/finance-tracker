"use client"

import * as React from "react"
import { ArrowLeft, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useWizard } from "../core"

export interface WizardNavButtonProps extends React.ComponentProps<typeof Button> {
  /** Callback executado ao fechar no primeiro passo (sobrescreve o do contexto) */
  onClose?: () => void
  /** Callback executado ao voltar em passos posteriores (sobrescreve o do contexto/back) */
  onBack?: () => void
}

/**
 * Botão de navegação inteligente para cabeçalhos de Wizard:
 * - No primeiro passo: exibe o ícone "X" (ativo se houver `onClose`, desabilitado caso contrário).
 * - A partir do segundo passo: exibe o ícone de seta "←" (executa `onBack` customizado ou `back()` nativo).
 */
export function WizardNavButton({
  onClose: propOnClose,
  onBack: propOnBack,
  variant = "ghost",
  size = "icon-sm",
  className,
  ...props
}: WizardNavButtonProps) {
  const { isFirst, isSubmitting, back, onClose: ctxOnClose, onBack: ctxOnBack } = useWizard()

  const resolvedOnClose = propOnClose ?? ctxOnClose
  const resolvedOnBack = propOnBack ?? ctxOnBack

  // Primeiro passo: modo fechar (X)
  if (isFirst) {
    const hasCloseAction = Boolean(resolvedOnClose)
    return (
      <Button
        type="button"
        variant={variant}
        size={size}
        disabled={!hasCloseAction || isSubmitting}
        onClick={hasCloseAction ? resolvedOnClose : undefined}
        aria-label={hasCloseAction ? "Fechar" : "Ação indisponível"}
        className={cn(
          "shrink-0 text-muted-foreground hover:text-foreground transition-colors",
          !hasCloseAction && "opacity-30 cursor-not-allowed",
          className
        )}
        {...props}
      >
        <X className="size-4" />
      </Button>
    )
  }

  // Passos seguintes: modo voltar (←)
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={isSubmitting}
      onClick={resolvedOnBack ?? back}
      aria-label="Voltar para a etapa anterior"
      className={cn(
        "shrink-0 text-muted-foreground hover:text-foreground transition-colors",
        className
      )}
      {...props}
    >
      <ArrowLeft className="size-4" />
    </Button>
  )
}
