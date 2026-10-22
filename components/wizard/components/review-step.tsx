"use client"

import * as React from "react"
import { Pencil } from "lucide-react"

import { formatDateToPTBR } from "@/components/form/date-picker/utils"
import { flattenFormFields } from "@/types/form.types"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { CustomStepProps, FieldsStep } from "../core"
import { useWizard } from "../core"

export interface ReviewStepProps<TData = any> extends Partial<CustomStepProps<TData>> {
  className?: string
}

function defaultFormatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "—"
  }

  if (typeof value === "boolean") {
    return value ? "Sim" : "Não"
  }

  if (value instanceof Date) {
    return formatDateToPTBR(value)
  }

  if (typeof value === "string") {
    // Detecta ISO string de data
    if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/.test(value)) {
      const parsed = new Date(value)
      if (!Number.isNaN(parsed.getTime())) {
        return formatDateToPTBR(parsed)
      }
    }
    return value
  }

  if (typeof value === "number") {
    return String(value)
  }

  if (typeof File !== "undefined" && value instanceof File) {
    return value.name
  }

  if (typeof value === "object" && value !== null && "name" in value && typeof (value as any).name === "string") {
    return (value as any).name
  }

  if (Array.isArray(value)) {
    return value.map((v) => defaultFormatValue(v)).join(", ")
  }

  return String(value)
}

/**
 * Passo de revisão automático que sumariza todos os dados preenchidos nos passos anteriores.
 * As ações de avançar/voltar são gerenciadas externamente pelo WizardActions/WizardNext.
 */
export function ReviewStep<TData = any>({
  className,
  goTo,
}: ReviewStepProps<TData>) {
  const wizard = useWizard<TData>()
  const handleGoTo = goTo ?? wizard.goTo
  const { steps, data } = wizard

  // Filtra apenas os passos com campos declarativos que estão ativos
  const fieldSteps = steps.filter(
    (s): s is FieldsStep<TData, any, any> => "fields" in s && Array.isArray(s.fields)
  )

  return (
    <div className={cn("space-y-4", className)}>
      {fieldSteps.map((step) => {
        // Filtra campos visíveis (não ocultos pelos dados atuais)
        const visibleFields = flattenFormFields(step.fields).filter(
          (field) => !field.hidden?.(data as any, step.context)
        )

        if (visibleFields.length === 0) return null

        return (
          <div
            key={step.id}
            className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-xs"
          >
            <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
              <h3 className="text-sm font-semibold text-foreground">
                {step.title}
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleGoTo(step.id)}
                className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <Pencil className="size-3" />
                Editar
              </Button>
            </div>

            <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
              {visibleFields.map((field) => {
                const rawValue = (data as any)?.[field.name]
                const labelText =
                  typeof field.label === "string" ? field.label : String(field.name)

                const displayValue = field.display
                  ? field.display(rawValue)
                  : defaultFormatValue(rawValue)

                return (
                  <div key={String(field.name)} className="flex flex-col">
                    <dt className="text-xs font-medium text-muted-foreground">
                      {labelText}
                    </dt>
                    <dd className="mt-0.5 text-sm font-medium text-foreground">
                      {displayValue}
                    </dd>
                  </div>
                )
              })}
            </dl>
          </div>
        )
      })}
    </div>
  )
}
