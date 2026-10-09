"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useWizard } from "../core"

export interface WizardStepperProps {
  className?: string
  /** Orientação visual do stepper */
  orientation?: "horizontal" | "vertical"
  /**
   * Variante visual:
   * - "default": exibe todos os títulos de passos (ideal para páginas e cards largos)
   * - "compact": exibe apenas indicadores circulares e o nome do passo atual (ideal para Sheets e telas mobile)
   */
  variant?: "default" | "compact"
}

export function WizardStepper({
  className,
  orientation = "horizontal",
  variant = "default",
}: WizardStepperProps) {
  const { steps, index: currentIndex, step: currentStep, goTo, completedStepIds, progress } = useWizard()

  if (variant === "compact") {
    return (
      <nav aria-label="Etapas do formulário" className={cn("w-full py-1 space-y-2", className)}>
        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
          <span>
            Passo {currentIndex + 1} de {steps.length} · {currentStep.title}
          </span>
          <span>{progress}%</span>
        </div>
        <ol className="flex items-center gap-1.5 w-full">
          {steps.map((step, idx) => {
            const isCompleted = completedStepIds.includes(step.id) || idx < currentIndex
            const isCurrent = idx === currentIndex
            const isClickable = isCompleted && !isCurrent

            return (
              <li key={step.id} className="flex-1 flex items-center">
                <button
                  type="button"
                  onClick={() => isClickable && goTo(step.id)}
                  disabled={!isClickable}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={`Passo ${idx + 1}: ${step.title}`}
                  className={cn(
                    "h-2 w-full rounded-full transition-all outline-none",
                    isCompleted && "bg-primary cursor-pointer hover:bg-primary/80 focus-visible:ring-2 focus-visible:ring-ring",
                    isCurrent && "bg-primary ring-2 ring-primary/20",
                    !isCompleted && !isCurrent && "bg-muted cursor-not-allowed opacity-60"
                  )}
                />
              </li>
            )
          })}
        </ol>
      </nav>
    )
  }

  return (
    <nav
      aria-label="Etapas do formulário"
      className={cn(
        orientation === "horizontal"
          ? "flex items-center justify-between w-full overflow-x-auto py-2"
          : "flex flex-col gap-4",
        className
      )}
    >
      <ol
        className={cn(
          "flex w-full",
          orientation === "horizontal"
            ? "items-center"
            : "flex-col space-y-4"
        )}
      >
        {steps.map((step, idx) => {
          const isCompleted = completedStepIds.includes(step.id) || idx < currentIndex
          const isCurrent = idx === currentIndex
          const isUpcoming = !isCompleted && !isCurrent
          const isClickable = isCompleted && !isCurrent

          return (
            <li
              key={step.id}
              className={cn(
                "flex items-center",
                orientation === "horizontal" ? "flex-1 last:flex-none" : "w-full"
              )}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => isClickable && goTo(step.id)}
                  disabled={!isClickable}
                  aria-current={isCurrent ? "step" : undefined}
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors outline-none",
                    isCompleted &&
                      "bg-primary text-primary-foreground cursor-pointer hover:bg-primary/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isCurrent &&
                      "border-2 border-primary bg-background text-primary font-bold ring-4 ring-primary/10",
                    isUpcoming &&
                      "border border-border bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                  )}
                >
                  {isCompleted ? (
                    <Check className="size-4 stroke-[2.5]" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </button>

                <div className="flex flex-col text-left">
                  <span
                    className={cn(
                      "text-xs font-medium transition-colors",
                      isCurrent && "text-foreground font-semibold",
                      isCompleted && "text-foreground/80",
                      isUpcoming && "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </span>
                  {step.description && orientation === "vertical" && (
                    <span className="text-[11px] text-muted-foreground">
                      {step.description}
                    </span>
                  )}
                </div>
              </div>

              {/* Linha divisora entre passos no layout horizontal */}
              {orientation === "horizontal" && idx < steps.length - 1 && (
                <div
                  aria-hidden="true"
                  className={cn(
                    "mx-4 h-0.5 flex-1 transition-colors",
                    idx < currentIndex ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
