"use client"

import * as React from "react"
import { useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { DataFormFields, FormContent, FormRoot } from "@/components/form"
import { cn } from "@/lib/utils"
import type { FieldsStep } from "./types"
import { useWizard } from "./wizard"
import { wizardFormId } from "./wizard-form-id"

function FieldsStepForm<TData = any>({
  step,
  className,
}: {
  step: FieldsStep<TData, any, any>
  className?: string
}) {
  const { data, next, draftRef } = useWizard<TData>()
  const formId = wizardFormId(step.id)

  const form = useForm({
    resolver: zodResolver(step.schema),
    defaultValues: data as any,
  })

  // Registra o getter síncrono de rascunho para que botões externos de voltar salvem os dados atuais
  useEffect(() => {
    draftRef.current = form.getValues
    return () => {
      draftRef.current = null
    }
  }, [form, draftRef])

  const handleSubmit = (values: any) => {
    next(values)
  }

  return (
    <div className={cn("w-full", className)}>
      <FormRoot
        id={formId}
        form={form}
        onSubmit={handleSubmit}
        className="gap-4"
      >
        <FormContent>
          <DataFormFields
            fields={step.fields}
            context={step.context}
            layout={step.layout}
          />
        </FormContent>
      </FormRoot>
    </div>
  )
}

export interface WizardStepContentProps extends React.ComponentProps<"section"> {}

export function WizardStepContent({ className, ...props }: WizardStepContentProps) {
  const { step, index, steps, data, next, back, update, goTo, isFirst, isLast, isSubmitting } =
    useWizard()
  const sectionRef = useRef<HTMLElement>(null)
  const isFirstMountRef = useRef(true)

  // Move o foco para o container da seção nas trocas de passo, ignorando a montagem inicial
  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false
      return
    }
    sectionRef.current?.focus()
  }, [step.id])

  return (
    <section
      ref={sectionRef}
      tabIndex={-1}
      aria-label={step.title}
      className={cn(
        "w-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded animate-in fade-in-50 duration-200 motion-reduce:animate-none",
        className
      )}
      {...props}
    >
      {/* Região aria-live para leitores de tela */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {`Passo ${index + 1} de ${steps.length}: ${step.title}`}
      </div>

      <div key={step.id}>
        {step.component ? (
          <step.component
            data={data}
            onNext={next}
            onBack={back}
            onUpdate={update}
            goTo={goTo}
            isFirst={isFirst}
            isLast={isLast}
            isSubmitting={isSubmitting}
          />
        ) : (
          <FieldsStepForm key={step.id} step={step as FieldsStep<any, any, any>} />
        )}
      </div>
    </section>
  )
}
