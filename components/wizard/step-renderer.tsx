"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { WizardActions } from "./wizard-actions"
import { WizardStepContent } from "./wizard-step-content"
import { WizardStepHeader } from "./wizard-step-header"

export interface StepRendererProps extends React.ComponentProps<"div"> {
  hideHeader?: boolean
  hideFooter?: boolean
}

/**
 * Componente pronto que combina cabeçalho, conteúdo do passo e botões de ação para uso inline em cards.
 */
export function StepRenderer({
  className,
  hideHeader = false,
  hideFooter = false,
  ...props
}: StepRendererProps) {
  return (
    <div className={cn("flex flex-col w-full", className)} {...props}>
      {!hideHeader && <WizardStepHeader />}
      <WizardStepContent />
      {!hideFooter && (
        <div className="pt-6 border-t border-border mt-6">
          <WizardActions />
        </div>
      )}
    </div>
  )
}
