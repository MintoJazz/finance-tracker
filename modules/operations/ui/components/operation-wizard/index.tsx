"use client"

import * as React from "react"
import {
  Wizard,
  WizardDialogLayout,
  WizardDrawerLayout,
  useWizard,
} from "@/components/wizard"
import { cn } from "@/lib/utils"
import type { OperationDraft } from "@/modules/operations/models/operation-input.schema"
import type { ViewPort } from "@/types/adaptive.types"
import { IntentPillsBar } from "../intent-pills-bar"
import { buildViewportSteps } from "./build-viewport-steps"
import { useOperationWizard } from "./context"

function OperationWizardFooterPills() {
  const { step } = useWizard()
  const { logicalSteps } = useOperationWizard()

  const logicalStepId = React.useMemo(() => {
    if (!step?.id) return ""
    const exact = logicalSteps.find((s) => s.id === step.id)
    if (exact) return exact.id
    const matched = logicalSteps.find(
      (s) => step.id.startsWith(`${s.id}.`) || s.id.startsWith(`${step.id}.`)
    )
    return matched?.id ?? step.id
  }, [step?.id, logicalSteps])

  if (!logicalStepId) return null

  return <IntentPillsBar stepId={logicalStepId} />
}

export interface OperationWizardContentProps {
  viewport: ViewPort
  onComplete: (payload: Partial<OperationDraft>) => void | Promise<void>
  onClose?: () => void
  className?: string
}

/**
 * Renderizador do Wizard de Operações acoplado ao `OperationWizardProvider`.
 * - No Desktop: usa `WizardDialogLayout` com 1 página por etapa lógica.
 * - No Mobile: usa `WizardDrawerLayout` com telas granulares e seletores horizontais.
 */
export function OperationWizardContent({
  viewport,
  onComplete,
  onClose,
  className,
}: OperationWizardContentProps) {
  const {
    sessionKey,
    draft,
    logicalSteps,
    prunedPayload,
    setCurrentViewportStepId,
    updateDraft,
  } = useOperationWizard()

  const steps = React.useMemo(
    () => buildViewportSteps(logicalSteps, viewport),
    [logicalSteps, viewport]
  )

  const handleComplete = React.useCallback(
    async (_rawData: OperationDraft) => {
      await onComplete(prunedPayload)
    },
    [onComplete, prunedPayload]
  )

  return (
    <div className={cn("w-full flex flex-col min-h-0 flex-1", className)}>
      <Wizard<OperationDraft>
        key={`${sessionKey}-${viewport}`}
        steps={steps}
        initialData={draft}
        onStepChange={(stepId) => {
          setCurrentViewportStepId(stepId)
        }}
        onChange={({ data, stepId }) => {
          updateDraft(data)
          setCurrentViewportStepId(stepId)
        }}
        onComplete={handleComplete}
        onClose={onClose}
        pruneInactive={false}
        className="flex flex-col min-h-0 flex-1"
      >
        {viewport === "desktop" ? (
          <WizardDialogLayout
            showBack={true}
            footerExtra={<OperationWizardFooterPills />}
          />
        ) : (
          <WizardDrawerLayout
            onClose={onClose}
            showBack={true}
            footerExtra={<OperationWizardFooterPills />}
          />
        )}
      </Wizard>
    </div>
  )
}

export * from "./types"
export * from "./context"
export * from "./build-viewport-steps"
export * from "./steps"
