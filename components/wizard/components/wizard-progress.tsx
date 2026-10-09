"use client"

import * as React from "react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useWizard } from "../core"

export interface WizardProgressProps {
  className?: string
  /** Oculta o texto descritivo acima da barra */
  hideLabel?: boolean
  /** Formato visual: barra contínua ou segmentada pelos passos */
  variant?: "continuous" | "segmented"
  /** Exibe o botão de navegação (voltar/fechar) ao lado da barra de progresso (padrão: true) */
  showNavButton?: boolean
}

export function WizardProgress({
  className,
  hideLabel = false,
  variant = "segmented",
  showNavButton = true,
}: WizardProgressProps) {
  const { index, steps, step, progress, completedStepIds, goTo } = useWizard()
  const currentStepNumber = index + 1
  const totalSteps = steps.length
  const accessibleLabel = `Progresso do formulário: Passo ${currentStepNumber} de ${totalSteps} (${step.title})`

  const progressContent = (
    <div className="flex-1 min-w-0 space-y-2">
      {!hideLabel && (
        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
          <span className="truncate">
            Passo {currentStepNumber} de {totalSteps} · {step.title}
          </span>
          <span className="shrink-0">{progress}%</span>
        </div>
      )}

      {variant === "segmented" ? (
        <ol className="flex items-center gap-1.5 w-full">
          {steps.map((s, idx) => {
            const isCompleted = completedStepIds.includes(s.id) || idx < index
            const isCurrent = idx === index
            const isClickable = isCompleted && !isCurrent

            return (
              <li key={s.id} className="flex-1 flex items-center">
                <button
                  type="button"
                  onClick={() => isClickable && goTo(s.id)}
                  disabled={!isClickable}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={`Passo ${idx + 1}: ${s.title}`}
                  className={cn(
                    "h-2 w-full rounded-full transition-all outline-none",
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
      ) : (
        <Progress
          value={progress}
          aria-label={accessibleLabel}
          aria-valuetext={`Passo ${currentStepNumber} de ${totalSteps}: ${step.title}`}
        />
      )}
    </div>
  )

  if (!showNavButton) {
    return <div className={cn("w-full space-y-2", className)}>{progressContent}</div>
  }

  return (
    <div className={cn("w-full flex items-center gap-2.5", className)}>
      {progressContent}
    </div>
  )
}
