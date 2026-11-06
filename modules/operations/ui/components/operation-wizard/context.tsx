"use client"

import * as React from "react"
import { deepMergeWizardData } from "@/components/wizard"
import {
  DEFAULT_CATEGORY_COLOR,
  DEFAULT_CATEGORY_ICON,
} from "@/modules/categories/models/category.schema"
import { OPERATION_STEP_CATALOG } from "@/modules/operations/application/intents/catalog"
import type { IntentDefinition } from "@/modules/operations/application/intents/types"
import {
  availableIntents as computeAvailableIntents,
  offeredIntentsForStep,
  resolveSteps,
  sanitizeActiveIntents,
  type OperationStepCatalog,
} from "@/modules/operations/application/steps/interpreter"
import type { StepDefinition } from "@/modules/operations/application/steps/types"
import {
  pruneInactiveOperationSlices,
  type OperationDraft,
  type OperationIntentKey,
} from "@/modules/operations/models/operation-input.schema"
import type { OperationSeed } from "@/modules/operations/models/operation-seed.schema"
import type { OperationLookupData } from "./types"

export interface OperationWizardContextValue {
  sessionKey: number
  seed: OperationSeed
  lookups: OperationLookupData
  catalog: OperationStepCatalog<OperationIntentKey>
  draft: Partial<OperationDraft>
  activeIntents: OperationIntentKey[]
  logicalSteps: StepDefinition<OperationIntentKey>[]
  availableIntents: OperationIntentKey[]
  prunedPayload: Partial<OperationDraft>
  currentViewportStepId: string
  setCurrentViewportStepId: (stepId: string) => void
  updateDraft: (patch: Partial<OperationDraft>) => void
  resetWithSeed: (nextSeed: OperationSeed) => void
  addIntent: (key: OperationIntentKey) => void
  removeIntent: (key: OperationIntentKey) => void
  toggleIntent: (key: OperationIntentKey) => void
  getOfferedIntentsForStep: (
    stepId: string
  ) => IntentDefinition<OperationIntentKey, StepDefinition<OperationIntentKey>>[]
}

const OperationWizardContext =
  React.createContext<OperationWizardContextValue | null>(null)

export function useOperationWizard(): OperationWizardContextValue {
  const ctx = React.useContext(OperationWizardContext)
  if (!ctx) {
    throw new Error(
      "useOperationWizard deve ser utilizado dentro de um <OperationWizardProvider />"
    )
  }
  return ctx
}

export function buildInitialDraftFromSeed(
  seed: OperationSeed,
  lookups?: OperationLookupData
): Partial<OperationDraft> {
  const todayIso = new Date().toISOString().slice(0, 10)
  const matchedCustody = seed.custodyBalanceId
    ? lookups?.custodies.find((c) => c.id === seed.custodyBalanceId)
    : undefined
  const resolvedCustodyType =
    seed.custodyType ?? matchedCustody?.type ?? "WALLET"
  const defaultOpenCycle =
    resolvedCustodyType === "CREDIT" && seed.custodyBalanceId
      ? lookups?.creditCycles.find(
          (cy) =>
            cy.cardBalanceId === seed.custodyBalanceId && cy.status === "OPEN"
        )
      : undefined

  return {
    nature: seed.nature ?? "PAY",
    intents: (seed.intents ?? []) as OperationIntentKey[],
    base: {
      custodyBalanceId: seed.custodyBalanceId,
      custodyType: resolvedCustodyType,
      amount: seed.amount,
      dueDate: seed.dueDate ?? todayIso,
      competanceDate:
        seed.competanceDate ?? defaultOpenCycle?.closingDate ?? null,
      description: seed.description ?? "",
      categoryId: seed.categoryId ?? null,
      subcategoryId: seed.subcategoryId ?? null,
    },
    CREATE_CATEGORY: {
      name: "",
      color: DEFAULT_CATEGORY_COLOR,
      icon: DEFAULT_CATEGORY_ICON,
    },
    CREATE_SUBCATEGORY: {
      name: "",
      color: DEFAULT_CATEGORY_COLOR,
      icon: DEFAULT_CATEGORY_ICON,
    },
    DEMO_INSTALLMENTS: {
      count: 2,
      intervalDays: 30,
    },
    DEMO_REIMBURSEMENT: {
      targetIds: [],
      reimbursedAmount: seed.amount ?? undefined,
    },
    DEMO_SPLIT_GROUP: {
      mode: "EQUAL",
      memberWeights: {},
    },
  }
}

export interface OperationWizardProviderProps {
  seed?: OperationSeed
  lookups: OperationLookupData
  catalog?: OperationStepCatalog<OperationIntentKey>
  children: React.ReactNode
}

export function OperationWizardProvider({
  seed: initialSeed = {},
  lookups,
  catalog = OPERATION_STEP_CATALOG,
  children,
}: OperationWizardProviderProps) {
  const [sessionKey, setSessionKey] = React.useState(0)
  const [seed, setSeed] = React.useState<OperationSeed>(initialSeed)
  const [draft, setDraft] = React.useState<Partial<OperationDraft>>(() =>
    buildInitialDraftFromSeed(initialSeed, lookups)
  )
  const [currentViewportStepId, setCurrentViewportStepId] =
    React.useState<string>("")

  const activeIntents = React.useMemo(() => {
    const rawIntents = (draft.intents ?? []) as OperationIntentKey[]
    return sanitizeActiveIntents(rawIntents, catalog, draft)
  }, [draft, catalog])

  // Sincroniza `draft.intents` caso `sanitizeActiveIntents` tenha revogado alguma intenção em cascata
  React.useEffect(() => {
    const currentList = (draft.intents ?? []) as OperationIntentKey[]
    const isSame =
      currentList.length === activeIntents.length &&
      currentList.every((k, i) => k === activeIntents[i])

    if (!isSame) {
      setDraft((prev) => ({
        ...prev,
        intents: activeIntents,
      }))
    }
  }, [activeIntents, draft.intents])

  const logicalSteps = React.useMemo(
    () =>
      resolveSteps(
        {
          nature: draft.nature ?? seed.nature,
          intents: activeIntents,
          seed,
          data: draft,
        },
        catalog
      ),
    [draft, seed, activeIntents, catalog]
  )

  const available = React.useMemo(
    () => computeAvailableIntents(activeIntents, catalog, { data: draft }),
    [activeIntents, catalog, draft]
  )

  const prunedPayload = React.useMemo(
    () => pruneInactiveOperationSlices(draft, logicalSteps, activeIntents),
    [draft, logicalSteps, activeIntents]
  )

  const updateDraft = React.useCallback((patch: Partial<OperationDraft>) => {
    setDraft((prev) => deepMergeWizardData(prev, patch))
  }, [])

  const resetWithSeed = React.useCallback(
    (nextSeed: OperationSeed) => {
      setSessionKey((prev) => prev + 1)
      setSeed(nextSeed)
      setDraft(buildInitialDraftFromSeed(nextSeed, lookups))
      setCurrentViewportStepId("")
    },
    [lookups]
  )

  const addIntent = React.useCallback(
    (key: OperationIntentKey) => {
      setDraft((prev) => {
        const current = (prev.intents ?? []) as OperationIntentKey[]
        if (current.includes(key)) return prev

        // Remove intenções mutuamente exclusivas antes de adicionar a nova
        const def = catalog.intents[key]
        const filtered = current.filter((existing) => {
          const existingDef = catalog.intents[existing]
          const excludedByNew = def?.excludes.includes(existing)
          const excludesNew = existingDef?.excludes.includes(key)
          return !excludedByNew && !excludesNew
        })

        const nextIntents = sanitizeActiveIntents(
          [...filtered, key],
          catalog,
          prev
        )

        return {
          ...prev,
          intents: nextIntents,
        }
      })
    },
    [catalog]
  )

  const removeIntent = React.useCallback(
    (key: OperationIntentKey) => {
      setDraft((prev) => {
        const current = (prev.intents ?? []) as OperationIntentKey[]
        if (!current.includes(key)) return prev
        const def = catalog.intents[key]
        const toRemove = new Set([key, ...(def?.implies ?? [])])
        const remaining = current.filter((k) => !toRemove.has(k))
        const nextIntents = sanitizeActiveIntents(remaining, catalog, prev)
        return {
          ...prev,
          intents: nextIntents,
        }
      })
    },
    [catalog]
  )

  const toggleIntent = React.useCallback(
    (key: OperationIntentKey) => {
      if (activeIntents.includes(key)) {
        removeIntent(key)
      } else {
        addIntent(key)
      }
    },
    [activeIntents, addIntent, removeIntent]
  )

  const getOfferedIntentsForStep = React.useCallback(
    (stepId: string) =>
      offeredIntentsForStep(activeIntents, catalog, stepId, draft),
    [activeIntents, catalog, draft]
  )

  const value = React.useMemo<OperationWizardContextValue>(
    () => ({
      sessionKey,
      seed,
      lookups,
      catalog,
      draft,
      activeIntents,
      logicalSteps,
      availableIntents: available,
      prunedPayload,
      currentViewportStepId,
      setCurrentViewportStepId,
      updateDraft,
      resetWithSeed,
      addIntent,
      removeIntent,
      toggleIntent,
      getOfferedIntentsForStep,
    }),
    [
      sessionKey,
      seed,
      lookups,
      catalog,
      draft,
      activeIntents,
      logicalSteps,
      available,
      prunedPayload,
      currentViewportStepId,
      updateDraft,
      resetWithSeed,
      addIntent,
      removeIntent,
      toggleIntent,
      getOfferedIntentsForStep,
    ]
  )

  return (
    <OperationWizardContext.Provider value={value}>
      {children}
    </OperationWizardContext.Provider>
  )
}
