"use client"

import * as React from "react"
import { formatDate, formatMoney } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import type { CycleOption } from "@/modules/cycles/models/cycle-option.schema"
import { getCardInvoiceOptionsAction } from "@/modules/cycles/ui/actions/get-card-invoice-options.action"
import {
  CYCLE_STATUS_TONE_MAP,
  STATUS_BADGE_CLASSES,
} from "@/modules/cycles/ui/components/cycle-summary/labels"
import type { ChooseCardInvoiceIntentSlice } from "@/modules/operations/models/intents/choose-card-invoice.schema"
import {
  EntityPicker,
  type EntityPickerItem,
} from "@/modules/operations/ui/components/entity-picker"
import { useOperationWizard } from "@/modules/operations/ui/components/operation-wizard/context"

export interface CardInvoicePickerProps {
  value?: Partial<ChooseCardInvoiceIntentSlice>
  onChange?: (val: ChooseCardInvoiceIntentSlice) => void
  variant?: "carousel" | "grid"
  className?: string
}

function toIsoDateString(value: string | Date): string {
  if (value instanceof Date) {
    const y = value.getFullYear()
    const m = String(value.getMonth() + 1).padStart(2, "0")
    const d = String(value.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
  }
  return value.slice(0, 10)
}

function computeInitialOffset(
  currentYear: number,
  committedDueDate?: string,
  baseDueDate?: string
): number {
  const refIso = committedDueDate || baseDueDate
  if (refIso && /^\d{4}/.test(refIso)) {
    const parsedYear = Number(refIso.slice(0, 4))
    if (
      Number.isInteger(parsedYear) &&
      parsedYear >= 2000 &&
      parsedYear <= 2100
    ) {
      return parsedYear - currentYear
    }
  }
  return 0
}

export function CardInvoicePicker({
  value,
  onChange,
  variant = "grid",
  className,
}: CardInvoicePickerProps) {
  const { draft, updateDraft, lookups } = useOperationWizard()

  const cardId = draft.base?.custodyBalanceId
  const selectedCard = React.useMemo(
    () => lookups.custodies.find((c) => c.id === cardId),
    [lookups.custodies, cardId]
  )

  const currentYear = React.useMemo(() => new Date().getFullYear(), [])
  const rawSlice = value ?? draft.CHOOSE_CARD_INVOICE
  const hasCommittedSelection = Boolean(
    rawSlice?.from && draft.base?.competanceDate
  )
  const selectedFrom = hasCommittedSelection ? rawSlice?.from ?? "" : ""

  const [offset, setOffset] = React.useState<number>(() =>
    computeInitialOffset(
      currentYear,
      hasCommittedSelection ? rawSlice?.dueDate : undefined,
      draft.base?.dueDate
    )
  )
  const [options, setOptions] = React.useState<CycleOption[]>([])
  const [loading, setLoading] = React.useState<boolean>(Boolean(cardId))
  const [error, setError] = React.useState<string | null>(null)

  const needsAutoSelectRef = React.useRef<boolean>(!hasCommittedSelection)
  const prevCardIdRef = React.useRef<number | undefined>(cardId)
  const latestRef = React.useRef({
    onChange,
    updateDraft,
    baseDueDate: draft.base?.dueDate,
  })
  latestRef.current = {
    onChange,
    updateDraft,
    baseDueDate: draft.base?.dueDate,
  }

  React.useEffect(() => {
    if (prevCardIdRef.current !== cardId) {
      prevCardIdRef.current = cardId
      needsAutoSelectRef.current = true
      setOffset(
        computeInitialOffset(
          currentYear,
          undefined,
          latestRef.current.baseDueDate
        )
      )
    }
  }, [cardId, currentYear])

  React.useEffect(() => {
    if (!cardId) {
      setOptions([])
      setError("Selecione um cartão de crédito primeiro.")
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    getCardInvoiceOptionsAction({
      balanceId: cardId,
      offset,
    })
      .then((res) => {
        if (cancelled) return
        if (!res.success || !res.data) {
          setOptions([])
          setError(
            res.error ?? "Não foi possível carregar as faturas deste cartão."
          )
          return
        }

        const fetched = res.data
        setOptions(fetched)

        if (needsAutoSelectRef.current && fetched.length > 0) {
          needsAutoSelectRef.current = false
          const baseDueDate = latestRef.current.baseDueDate
          const defaultOption =
            (baseDueDate && /^\d{4}-\d{2}-\d{2}$/.test(baseDueDate)
              ? fetched.find(
                  (opt) => opt.from <= baseDueDate && baseDueDate <= opt.to
                )
              : undefined) ??
            fetched.find((opt) => opt.status === "OPEN") ??
            fetched[0]

          if (defaultOption) {
            const nextSlice: ChooseCardInvoiceIntentSlice = {
              from: defaultOption.from,
              to: defaultOption.to,
              dueDate: toIsoDateString(defaultOption.dueDate),
              label: defaultOption.label,
            }
            latestRef.current.onChange?.(nextSlice)
            latestRef.current.updateDraft({
              CHOOSE_CARD_INVOICE: nextSlice,
              base: {
                competanceDate: defaultOption.from,
              },
            })
          }
        }
      })
      .catch((err) => {
        if (cancelled) return
        console.error("[CardInvoicePicker] Erro ao buscar faturas:", err)
        setOptions([])
        setError("Erro inesperado ao carregar as faturas do cartão.")
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [cardId, offset])

  const handleSelect = (fromId: string | null) => {
    if (!fromId) return
    const opt = options.find((o) => o.from === fromId)
    if (!opt) return

    needsAutoSelectRef.current = false
    const nextSlice: ChooseCardInvoiceIntentSlice = {
      from: opt.from,
      to: opt.to,
      dueDate: toIsoDateString(opt.dueDate),
      label: opt.label,
    }
    onChange?.(nextSlice)
    updateDraft({
      CHOOSE_CARD_INVOICE: nextSlice,
      base: {
        competanceDate: opt.from,
      },
    })
  }

  const displayYear = currentYear + offset

  const items = React.useMemo<EntityPickerItem<string>[]>(
    () =>
      options.map((opt) => {
        const statusInfo = CYCLE_STATUS_TONE_MAP[opt.status] ?? {
          label: opt.status,
          tone: "neutral" as const,
        }
        const badgeClass =
          STATUS_BADGE_CLASSES[statusInfo.tone] ?? STATUS_BADGE_CLASSES.neutral
        const dueIso = toIsoDateString(opt.dueDate)

        return {
          id: opt.from,
          color: selectedCard?.color,
          titleText: opt.label,
          title: (
            <div className="flex items-center gap-2 min-w-0">
              <span className="truncate">{opt.label}</span>
              <span
                className={cn(
                  "shrink-0 whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-medium leading-none transition-colors",
                  badgeClass
                )}
              >
                {statusInfo.label}
              </span>
            </div>
          ),
          subtitle: `${formatDate(opt.from).slice(0, 5)} a ${formatDate(opt.to).slice(0, 5)} • Venc. ${formatDate(dueIso)}`,
          extra: (
            <span className="text-xs font-semibold tabular-nums text-foreground shrink-0">
              {formatMoney(opt.totalAmount)}
            </span>
          ),
          keywords: [opt.label, statusInfo.label, dueIso],
        }
      }),
    [options, selectedCard?.color]
  )

  return (
    <EntityPicker<string>
      hideIcon
      items={items}
      value={needsAutoSelectRef.current ? null : selectedFrom || null}
      onChange={handleSelect}
      variant={variant}
      searchable={false}
      allowDeselect={false}
      loading={loading}
      listClassName="max-h-[210px] sm:max-h-[240px]"
      emptyMessage={error ?? `Nenhuma fatura encontrada em ${displayYear}`}
      navigator={{
        title: String(displayYear),
        canPrev: true,
        canNext: true,
        onPrev: () => {
          needsAutoSelectRef.current = false
          setOffset((prev) => prev - 1)
        },
        onNext: () => {
          needsAutoSelectRef.current = false
          setOffset((prev) => prev + 1)
        },
        isLoading: loading,
        prevLabel: "Ano anterior",
        nextLabel: "Próximo ano",
      }}
      className={className}
    />
  )
}
