import type {
  OperationDraft,
  OperationIntentKey,
} from "../../models/operation-input.schema"
import type { CustodyBalanceType } from "../../models/operation-seed.schema"

export interface CustodyLookupItem {
  readonly id: number
  readonly name: string
  readonly type: CustodyBalanceType
  readonly subtitle: string
  readonly icon?: string
  readonly color?: string
  readonly balanceCents?: number
}

export interface CreditCycleLookupItem {
  readonly cardBalanceId: number
  readonly title: string
  readonly subtitle: string
  readonly closingDate: string
  readonly dueDate: string
  readonly status: "OPEN" | "FUTURE" | "CLOSED"
}

export interface CategoryLookupItem {
  readonly id: number
  readonly name: string
  readonly parentId?: number | null
  readonly parentName?: string
  readonly icon?: string | null
  readonly color?: string | null
}

export interface CommitmentLookupItem {
  readonly id: number
  readonly title: string
  readonly counterparty: string
  readonly balanceType: "PAYABLE" | "RECEIVABLE"
  readonly suggestedAmountCents: number
  readonly dueDate: string
  readonly icon?: string
}

export interface ReimbursementTargetLookupItem {
  readonly id: string
  readonly name: string
  readonly type: "CONTACT" | "GROUP"
  readonly subtitle: string
  readonly icon?: string
  readonly color?: string
  readonly members?: readonly { readonly id: string; readonly name: string }[]
}

export interface OperationLookupData {
  readonly custodies: readonly CustodyLookupItem[]
  readonly creditCycles: readonly CreditCycleLookupItem[]
  readonly categories: readonly CategoryLookupItem[]
  readonly subcategories: readonly CategoryLookupItem[]
  readonly commitments: readonly CommitmentLookupItem[]
  readonly reimbursementTargets: readonly ReimbursementTargetLookupItem[]
}

export type SummaryValue =
  | { readonly kind: "money"; readonly cents: number }
  | { readonly kind: "date"; readonly iso: string }
  | { readonly kind: "text"; readonly text: string }

export interface SummaryRow {
  readonly id: string
  readonly label: string
  readonly value: SummaryValue | null
  readonly stepId?: string
}

export interface SummarySection {
  readonly id: string
  readonly title: string
  readonly subtitle?: string
  readonly rows: readonly SummaryRow[]
  readonly footer?: readonly SummaryRow[]
}

export interface SummaryVisualItem {
  readonly title: string
  readonly subtitle?: string
  readonly icon?: string
  readonly color?: string
  readonly stepId?: string
}

export interface SummaryCard {
  readonly id: string
  readonly source: "BASE" | OperationIntentKey
  readonly order: number
  readonly title: string
  readonly icon: string
  readonly badge?: {
    readonly label: string
    readonly tone: "danger" | "success" | "neutral"
  }
  readonly visualItem?: SummaryVisualItem
  readonly rows?: readonly SummaryRow[]
  readonly sections?: readonly SummarySection[]
  readonly footer?: readonly SummaryRow[]
}

export interface SummaryContext {
  readonly payload: Partial<OperationDraft>
  readonly activeIntents: readonly OperationIntentKey[]
  readonly lookups: OperationLookupData
}

export interface IntentSummary {
  readonly order: number
  readonly build: (ctx: SummaryContext) => SummaryCard | null
  readonly decorateBase?: (card: SummaryCard, ctx: SummaryContext) => SummaryCard
}

