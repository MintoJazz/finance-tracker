import type {
  OperationDraft,
  OperationIntentKey,
} from "../../models/operation-input.schema"
import type { CustodyBalanceType } from "../../models/operation-seed.schema"
import type {
  CategoryOption,
  CreditCycleOption,
  CustodyOption,
  SubcategoryOption,
} from "../../models/operation-options.schema"

export type {
  CustodyOption,
  CreditCycleOption,
  CategoryOption,
  SubcategoryOption,
  OperationOptions,
} from "../../models/operation-options.schema"

export type CustodyLookupItem = CustodyOption
export type CreditCycleLookupItem = CreditCycleOption
export type CategoryLookupItem = CategoryOption | SubcategoryOption
export type SubcategoryLookupItem = SubcategoryOption

export interface OperationLookupData {
  readonly custodies: readonly CustodyOption[]
  readonly creditCycles: readonly CreditCycleOption[]
  readonly categories: readonly CategoryOption[]
  readonly subcategories: readonly SubcategoryOption[]
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
  readonly footer?: readonly SummaryRow[]
}

export interface SummaryContext {
  readonly payload: Partial<OperationDraft>
  readonly activeIntents: readonly OperationIntentKey[]
  readonly lookups: OperationLookupData
}
