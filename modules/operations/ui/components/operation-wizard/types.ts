import type { WizardStep } from "@/components/wizard"
import type { OperationDraft } from "@/modules/operations/models/operation-input.schema"

export type {
  CustodyLookupItem,
  CreditCycleLookupItem,
  CategoryLookupItem,
  CommitmentLookupItem,
  ReimbursementTargetLookupItem,
  OperationLookupData,
} from "@/modules/operations/application/summary/types"

export interface StepViews<TData = OperationDraft> {
  readonly desktop?: WizardStep<TData> | null
  readonly mobile: readonly WizardStep<TData>[]
}

export type StepViewsCatalog<
  TStepId extends string = string,
  TData = OperationDraft,
> = Record<TStepId, StepViews<TData>>
