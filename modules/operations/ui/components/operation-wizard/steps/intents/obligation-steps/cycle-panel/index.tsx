"use client"

import * as React from "react"
import type { CycleView } from "@/modules/cycles/models/obligation-cycle.schema"
import { getObligationCyclesAction } from "@/modules/operations/ui/actions/get-obligation-cycles.action"
import { CyclePanelDesktop } from "./cycle-panel-desktop"
import { CyclePanelMobile } from "./cycle-panel-mobile"
import { useOperationWizard } from "@/modules/operations/ui/components/operation-wizard/context"
import type { CustodyLookupItem } from "@/modules/operations/ui/components/operation-wizard/types"

export interface CyclePanelProps {
  value?: {
    referenceDate: string
    amount: number
    status?: CycleView["status"]
  }[]
  onChange?: (
    val: {
      referenceDate: string
      amount: number
      status?: CycleView["status"]
    }[]
  ) => void
  viewport?: "desktop" | "mobile"
  className?: string
}

export function CyclePanel({
  value,
  onChange,
  viewport = "desktop",
  className,
}: CyclePanelProps) {
  const { draft, updateDraft, lookups } = useOperationWizard()
  const isReceive = draft.nature === "RECEIVE"
  const sliceKey = isReceive ? "RECEIVE_OBLIGATION" : "PAY_OBLIGATION"

  const agreementId = (draft as any)?.[sliceKey]?.agreementId

  const [loading, setLoading] = React.useState(false)
  const [cycles, setCycles] = React.useState<CycleView[]>([])
  const [prevCursor, setPrevCursor] = React.useState<string | null>(null)
  const [nextCursor, setNextCursor] = React.useState<string | null>(null)

  // Busca inicial dos ciclos ancorados no primeiro em aberto
  const fetchCycles = React.useCallback(
    async (cursor?: string, direction?: "before" | "after") => {
      if (!agreementId) return
      setLoading(true)

      const res = await getObligationCyclesAction({
        agreementId,
        cursor,
        direction,
        limit: 12,
      })

      if (res.success && res.data) {
        setCycles((prev) => {
          if (!cursor) return [...res.data.items]
          const existingRefs = new Set(prev.map((c) => c.referenceDate))
          const newItems = res.data.items.filter(
            (c) => !existingRefs.has(c.referenceDate)
          )
          const combined =
            direction === "before"
              ? [...newItems, ...prev]
              : [...prev, ...newItems]
          return combined.sort((a, b) =>
            a.dueDate.localeCompare(b.dueDate) ||
            a.referenceDate.localeCompare(b.referenceDate)
          )
        })
        if (direction === "before" || !cursor) {
          setPrevCursor(res.data.prevCursor)
        }
        if (direction === "after" || !cursor) {
          setNextCursor(res.data.nextCursor)
        }
      }
      setLoading(false)
    },
    [agreementId]
  )

  React.useEffect(() => {
    setCycles([])
    setPrevCursor(null)
    setNextCursor(null)
    fetchCycles()
  }, [agreementId, fetchCycles])

  // Identifica ciclos selecionados a partir de allocations
  const currentAllocations =
    value ?? (draft as any)?.[sliceKey]?.allocations ?? []

  const selectedCycles = React.useMemo(() => {
    const allocMap = new Map(
      currentAllocations.map((a: { referenceDate: string; amount: number }) => [
        a.referenceDate,
        a.amount,
      ])
    )
    return cycles.filter((c) => allocMap.has(c.referenceDate))
  }, [cycles, currentAllocations])

  const totalAmount = React.useMemo(
    () => selectedCycles.reduce((sum, c) => sum + c.outstanding, 0),
    [selectedCycles]
  )

  const handleToggleCycle = (cycle: CycleView) => {
    const isCurrentlySelected = selectedCycles.some(
      (c) => c.referenceDate === cycle.referenceDate
    )

    let nextSelected: CycleView[]
    if (isCurrentlySelected) {
      nextSelected = selectedCycles.filter(
        (c) => c.referenceDate !== cycle.referenceDate
      )
    } else {
      nextSelected = [...selectedCycles, cycle]
    }

    const nextAllocations = nextSelected.map((c) => ({
      referenceDate: c.referenceDate,
      amount: c.outstanding,
      status: c.status,
    }))

    const nextTotal = nextSelected.reduce((sum, c) => sum + c.outstanding, 0)

    onChange?.(nextAllocations)
    updateDraft({
      [sliceKey]: {
        agreementId,
        allocations: nextAllocations,
      },
      base: {
        amount: nextTotal,
      },
    })
  }

  const handleToggleBatch = (targetCycles: CycleView[], select: boolean) => {
    const targetRefs = new Set(targetCycles.map((c) => c.referenceDate))
    let nextSelected: CycleView[]
    if (select) {
      const existingRefs = new Set(selectedCycles.map((c) => c.referenceDate))
      const toAdd = targetCycles.filter(
        (c) => !existingRefs.has(c.referenceDate) && c.status !== "SETTLED"
      )
      nextSelected = [...selectedCycles, ...toAdd]
    } else {
      nextSelected = selectedCycles.filter((c) => !targetRefs.has(c.referenceDate))
    }

    const nextAllocations = nextSelected.map((c) => ({
      referenceDate: c.referenceDate,
      amount: c.outstanding,
      status: c.status,
    }))
    const nextTotal = nextSelected.reduce((sum, c) => sum + c.outstanding, 0)

    onChange?.(nextAllocations)
    updateDraft({
      [sliceKey]: {
        agreementId,
        allocations: nextAllocations,
      },
      base: {
        amount: nextTotal,
      },
    })
  }

  // Nome do contrato/cartão
  const contractName = React.useMemo(() => {
    if (!agreementId) return undefined
    const sliceContractName = (draft as any)?.[sliceKey]?.contractName
    if (sliceContractName) return sliceContractName
    const fromCustody = lookups.custodies.find((c: CustodyLookupItem) => c.id === agreementId)
    if (fromCustody) return fromCustody.name
    return draft.base?.description?.replace(/^(Quitação|Recebimento)\s*-\s*/, "")
  }, [agreementId, draft, sliceKey, lookups.custodies])

  const panelProps = {
    contractName,
    cycles,
    selectedCycles,
    onToggleCycle: handleToggleCycle,
    onToggleBatch: handleToggleBatch,
    totalAmount,
    loading,
    hasPrev: Boolean(prevCursor),
    hasNext: Boolean(nextCursor),
    onLoadPrev: () => prevCursor && fetchCycles(prevCursor, "before"),
    onLoadNext: () => nextCursor && fetchCycles(nextCursor, "after"),
    className,
  }

  if (viewport === "mobile") {
    return <CyclePanelMobile {...panelProps} />
  }

  return <CyclePanelDesktop {...panelProps} />
}
