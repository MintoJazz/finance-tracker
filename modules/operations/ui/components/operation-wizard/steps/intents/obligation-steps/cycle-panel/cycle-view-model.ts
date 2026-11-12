import {
  differenceInCalendarDays,
  differenceInCalendarMonths,
  parseISO,
} from "date-fns"
import { formatDate, formatMoney } from "@/lib/formatters"
import type { CycleView } from "@/modules/cycles/models/obligation-cycle.schema"

export type CycleTone = "overdue" | "upcoming" | "settled"

export interface CycleRowVM {
  id: string
  referenceDate: string
  dueDate: string
  label: string // "Fevereiro 2025"
  dueLabel: string // "Venceu há 9 meses · 10/02/2025" ou "Restam de R$ 680,00 · 10/02/2025"
  dueRelativeText: string // "Venceu há 9 meses" ou "Vence em 15 dias"
  dueDateFormatted: string // "10/02/2025"
  amount: number // outstanding (ou settled se já liquidado)
  originalAmount?: number // original base se parcial
  tone: CycleTone
  isPartial: boolean
  isSettled: boolean
  isOverdue: boolean
  isUnrecorded: boolean
  disabled: boolean
  group: CycleTone
  raw: CycleView
}

export interface CycleGroupsVM {
  overdue: CycleRowVM[]
  upcoming: CycleRowVM[]
  settled: CycleRowVM[]
  allUnrecorded: boolean
}

export function formatCycleRelativeDue(
  dueDateIso: string,
  today: Date = new Date()
): { relative: string; formatted: string } {
  const formatted = formatDate(dueDateIso)
  const dueDate = parseISO(dueDateIso)
  const diffDays = differenceInCalendarDays(dueDate, today)
  const diffMonths = differenceInCalendarMonths(dueDate, today)

  if (diffDays < 0) {
    if (diffMonths <= -1) {
      const m = Math.abs(diffMonths)
      return {
        relative: `Venceu há ${m} ${m === 1 ? "mês" : "meses"}`,
        formatted,
      }
    }
    if (diffDays === -1) {
      return {
        relative: "Venceu ontem",
        formatted,
      }
    }
    const d = Math.abs(diffDays)
    return {
      relative: `Venceu há ${d} ${d === 1 ? "dia" : "dias"}`,
      formatted,
    }
  }

  if (diffDays === 0) {
    return {
      relative: "Vence hoje",
      formatted,
    }
  }

  if (diffDays === 1) {
    return {
      relative: "Vence amanhã",
      formatted,
    }
  }

  if (diffMonths >= 1) {
    return {
      relative: `Vence em ${diffMonths} ${diffMonths === 1 ? "mês" : "meses"}`,
      formatted,
    }
  }

  return {
    relative: `Vence em ${diffDays} dias`,
    formatted,
  }
}

export function toCycleRowVM(
  cycle: CycleView,
  today: Date = new Date()
): CycleRowVM {
  const isSettled = cycle.status === "SETTLED"
  const isPartial = cycle.status === "PARTIAL"
  const isUnrecorded = cycle.status === "UNRECORDED"
  const isOverdue = Boolean(cycle.isOverdue && !isSettled && cycle.outstanding > 0)

  let tone: CycleTone = "upcoming"
  if (isSettled) {
    tone = "settled"
  } else if (isOverdue) {
    tone = "overdue"
  }

  const { relative, formatted } = formatCycleRelativeDue(cycle.dueDate, today)

  let originalAmount: number | undefined
  if (isPartial) {
    originalAmount =
      cycle.expected ??
      (cycle.accrued > 0 ? cycle.accrued : cycle.outstanding + cycle.settled)
  }

  let dueLabel: string
  if (isSettled) {
    dueLabel = `Liquidado · ${formatted}`
  } else if (isPartial && originalAmount && originalAmount > cycle.outstanding) {
    dueLabel = `Restam de ${formatMoney(originalAmount)} · ${formatted}`
  } else {
    dueLabel = `${relative} · ${formatted}`
  }

  return {
    id: cycle.referenceDate,
    referenceDate: cycle.referenceDate,
    dueDate: cycle.dueDate,
    label: cycle.label,
    dueLabel,
    dueRelativeText: relative,
    dueDateFormatted: formatted,
    amount: isSettled ? cycle.settled : cycle.outstanding,
    originalAmount,
    tone,
    isPartial,
    isSettled,
    isOverdue,
    isUnrecorded,
    disabled: isSettled,
    group: tone,
    raw: cycle,
  }
}

export function groupCycles(
  cycles: readonly CycleView[],
  today: Date = new Date()
): CycleGroupsVM {
  const vms = cycles.map((c) => toCycleRowVM(c, today))

  const overdue = vms.filter((v) => v.group === "overdue")
  const upcoming = vms.filter((v) => v.group === "upcoming")
  const settled = vms.filter((v) => v.group === "settled")

  const openCycles = vms.filter((v) => !v.isSettled)
  const allUnrecorded =
    openCycles.length > 0 && openCycles.every((v) => v.isUnrecorded)

  return {
    overdue,
    upcoming,
    settled,
    allUnrecorded,
  }
}

