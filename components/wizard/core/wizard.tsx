"use client"

import * as React from "react"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import type {
  WizardContextValue,
  WizardProps,
  WizardStep,
} from "./types"
import { flattenFormFields } from "@/types/form.types"

const WizardContext = createContext<WizardContextValue<any> | null>(null)

export function useWizard<TData = any>(): WizardContextValue<TData> {
  const context = useContext(WizardContext)
  if (!context) {
    throw new Error("useWizard deve ser utilizado dentro de um <Wizard />")
  }
  return context as WizardContextValue<TData>
}

export function Wizard<TData = any>({
  steps,
  initialData,
  initialStepId,
  stepId: controlledStepId,
  onStepChange,
  onComplete,
  onClose,
  onBack,
  onChange,
  pruneInactive = true,
  className,
  children,
}: WizardProps<TData>) {
  const [data, setData] = useState<Partial<TData>>(() => initialData ?? {})
  const [internalStepId, setInternalStepId] = useState<string>(() => {
    if (controlledStepId) return controlledStepId
    if (initialStepId) return initialStepId
    return steps[0]?.id ?? ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [completedStepIds, setCompletedStepIds] = useState<Set<string>>(new Set())
  const draftRef = useRef<(() => any) | null>(null)

  const isControlled = controlledStepId !== undefined
  const currentStepId = isControlled ? controlledStepId : internalStepId

  // Sincroniza estado com initialData se fornecido posteriormente
  useEffect(() => {
    if (initialData) {
      setData((prev) => ({ ...prev, ...initialData }))
    }
  }, [initialData])

  // Filtra os passos ativos com base na função `when`
  const activeSteps = useMemo(() => {
    return steps.filter((step) => !step.when || step.when(data))
  }, [steps, data])

  // Garante que o passo atual seja válido dentro dos passos ativos
  const currentStepIndex = useMemo(() => {
    const idx = activeSteps.findIndex((s) => s.id === currentStepId)
    return idx !== -1 ? idx : 0
  }, [activeSteps, currentStepId])

  const currentStep = activeSteps[currentStepIndex] ?? steps[0]

  // Se o passo atual deixou de estar ativo (ex: condicional desativado), ajusta para o passo válido
  useEffect(() => {
    if (activeSteps.length > 0 && !activeSteps.some((s) => s.id === currentStepId)) {
      const fallbackId = activeSteps[0]?.id ?? ""
      if (isControlled) {
        onStepChange?.(fallbackId)
      } else {
        setInternalStepId(fallbackId)
      }
    }
  }, [activeSteps, currentStepId, isControlled, onStepChange])

  const setStep = useCallback(
    (newStepId: string, currentData: Partial<TData>) => {
      if (isControlled) {
        onStepChange?.(newStepId)
      } else {
        setInternalStepId(newStepId)
      }
      onChange?.({ data: currentData, stepId: newStepId })
    },
    [isControlled, onStepChange, onChange]
  )

  const update = useCallback(
    (patch: Partial<TData>) => {
      setData((prev) => {
        const nextData = { ...prev, ...patch }
        onChange?.({ data: nextData, stepId: currentStepId })
        return nextData
      })
    },
    [currentStepId, onChange]
  )

  const goTo = useCallback(
    (stepId: string) => {
      const targetStep = activeSteps.find((s) => s.id === stepId)
      if (targetStep) {
        const draft = draftRef.current?.()
        const merged = draft ? { ...data, ...draft } : data
        if (draft) {
          setData(merged)
        }
        setStep(stepId, merged)
      }
    },
    [activeSteps, data, setStep]
  )

  const back = useCallback(() => {
    if (currentStepIndex > 0) {
      const prevStep = activeSteps[currentStepIndex - 1]
      if (prevStep) {
        const draft = draftRef.current?.()
        const merged = draft ? { ...data, ...draft } : data
        if (draft) {
          setData(merged)
        }
        setStep(prevStep.id, merged)
      }
    }
  }, [currentStepIndex, activeSteps, data, setStep])

  const pruneOrphanedData = useCallback(
    (sourceData: Partial<TData>, currentActiveSteps: WizardStep<TData>[]): Partial<TData> => {
      if (!pruneInactive) return sourceData

      const activeSet = new Set(currentActiveSteps.map((s) => s.id))
      const inactiveSteps = steps.filter((s) => !activeSet.has(s.id))
      const cleaned = { ...sourceData }

      for (const step of inactiveSteps) {
        if ("fields" in step && Array.isArray(step.fields)) {
          for (const field of flattenFormFields(step.fields)) {
            delete (cleaned as any)[field.name]
          }
        }
      }

      return cleaned
    },
    [pruneInactive, steps]
  )

  const next = useCallback(
    async (patch?: Partial<TData>) => {
      const mergedData = patch ? { ...data, ...patch } : data
      setData(mergedData)

      // Recalcula passos ativos com os dados atualizados
      const updatedActiveSteps = steps.filter(
        (step) => !step.when || step.when(mergedData)
      )

      // Registra passo atual como concluído
      if (currentStep?.id) {
        setCompletedStepIds((prev) => new Set([...prev, currentStep.id]))
      }

      const activeIdx = updatedActiveSteps.findIndex(
        (s) => s.id === (currentStep?.id ?? currentStepId)
      )
      const isLastStep = activeIdx === updatedActiveSteps.length - 1

      if (isLastStep) {
        const finalData = pruneOrphanedData(mergedData, updatedActiveSteps)

        // Validação final de todos os passos ativos
        for (const step of updatedActiveSteps) {
          if ("schema" in step && step.schema) {
            const result = step.schema.safeParse(finalData)
            if (!result.success) {
              console.warn(
                `[Wizard] Validação final falhou no passo "${step.title}" (${step.id}):`,
                result.error
              )
              setStep(step.id, finalData)
              return
            }
          }
        }

        try {
          setIsSubmitting(true)
          await onComplete(finalData as TData)
        } finally {
          setIsSubmitting(false)
        }
      } else {
        const nextStep = updatedActiveSteps[activeIdx + 1]
        if (nextStep) {
          setStep(nextStep.id, mergedData)
        }
      }
    },
    [
      data,
      steps,
      currentStep,
      currentStepId,
      pruneOrphanedData,
      onComplete,
      setStep,
    ]
  )

  const progress = useMemo(() => {
    if (activeSteps.length <= 1) return 100
    return Math.round((currentStepIndex / (activeSteps.length - 1)) * 100)
  }, [currentStepIndex, activeSteps.length])

  const contextValue: WizardContextValue<TData> = useMemo(
    () => ({
      data,
      steps: activeSteps,
      allSteps: steps,
      step: currentStep,
      index: currentStepIndex,
      isFirst: currentStepIndex === 0,
      isLast: currentStepIndex === activeSteps.length - 1,
      progress,
      isSubmitting,
      completedStepIds: Array.from(completedStepIds),
      draftRef,
      onClose,
      onBack,
      next,
      back,
      goTo,
      update,
    }),
    [
      data,
      activeSteps,
      steps,
      currentStep,
      currentStepIndex,
      progress,
      isSubmitting,
      completedStepIds,
      onClose,
      onBack,
      next,
      back,
      goTo,
      update,
    ]
  )

  return (
    <WizardContext.Provider value={contextValue}>
      <div className={className}>
        {typeof children === "function" ? children(contextValue) : children}
      </div>
    </WizardContext.Provider>
  )
}
