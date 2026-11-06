"use client"

import * as React from "react"
import { useWizard, WizardReviewHint, type CustomStepProps } from "@/components/wizard"
import { resolveSummaryCards } from "@/modules/operations/application/summary/resolver"
import type { OperationDraft } from "@/modules/operations/models/operation-input.schema"
import { useOperationWizard } from "@/modules/operations/ui/components/operation-wizard/context"
import { SummaryCardView } from "@/modules/operations/ui/components/operation-summary"

export function OperationReviewCard(_props: CustomStepProps<OperationDraft>) {
  const { prunedPayload, lookups, activeIntents, catalog } = useOperationWizard()
  const { goTo } = useWizard()

  const cards = React.useMemo(() => {
    return resolveSummaryCards(
      {
        payload: prunedPayload,
        activeIntents,
        lookups,
      },
      catalog
    )
  }, [prunedPayload, activeIntents, lookups, catalog])

  const handleEdit = React.useCallback(
    (stepId: string) => {
      goTo(stepId)
    },
    [goTo]
  )

  return (
    <div className="space-y-3 py-0.5">
      {cards.map((card) => (
        <SummaryCardView key={card.id} card={card} onEdit={handleEdit} />
      ))}

      <WizardReviewHint>
        Revise os dados antes de confirmar. A operação e todas as intenções associadas serão processadas simultaneamente.
      </WizardReviewHint>
    </div>
  )
}
