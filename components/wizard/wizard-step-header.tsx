"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useWizard } from "./wizard"
import { WizardNavButton } from "./wizard-nav-button"

export interface WizardStepHeaderProps extends React.ComponentProps<"div"> {
  titleClassName?: string
  descriptionClassName?: string
  /** Exibe o botão de navegação voltar/fechar (padrão: true) */
  showNavButton?: boolean
  /** Callback opcional de fechamento para o primeiro passo */
  onClose?: () => void
  /** Callback opcional de retorno para passos posteriores */
  onBack?: () => void
}

export function WizardStepHeader({
  className,
  titleClassName,
  descriptionClassName,
  showNavButton = true,
  onClose,
  onBack,
  ...props
}: WizardStepHeaderProps) {
  const { step } = useWizard()

  return (
    <div
      className={cn("mb-4 flex items-center gap-3", className)}
      {...props}
    >
      {showNavButton && <WizardNavButton onClose={onClose} onBack={onBack} />}
      <div className="min-w-0 flex-1">
        <h2
          className={cn(
            "text-xl font-semibold tracking-tight text-foreground",
            titleClassName
          )}
        >
          {step.title}
        </h2>
        {step.description && (
          <p
            className={cn(
              "mt-1 text-sm text-muted-foreground",
              descriptionClassName
            )}
          >
            {step.description}
          </p>
        )}
      </div>
    </div>
  )
}