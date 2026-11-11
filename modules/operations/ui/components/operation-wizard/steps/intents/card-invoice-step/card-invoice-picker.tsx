"use client"

import * as React from "react"
import { Calendar, CreditCard } from "lucide-react"
import { MonthPicker } from "@/components/ui/monthpicker"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useOperationWizard } from "../../../context"

const PT_BR_MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
]

const PT_BR_MONTHS_SHORT = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
]

export interface CardInvoicePickerProps {
  value?: { month?: number; year?: number }
  onChange?: (val: { month: number; year: number }) => void
  className?: string
}

export function CardInvoicePicker({
  value,
  onChange,
  className,
}: CardInvoicePickerProps) {
  const { draft, updateDraft, lookups } = useOperationWizard()

  const cardId = draft.base?.custodyBalanceId
  const selectedCard = React.useMemo(
    () => lookups.custodies.find((c) => c.id === cardId),
    [lookups.custodies, cardId]
  )

  const selectedMonth = value?.month ?? draft.CHOOSE_CARD_INVOICE?.month
  const selectedYear = value?.year ?? draft.CHOOSE_CARD_INVOICE?.year

  const selectedDate = React.useMemo(() => {
    if (selectedMonth && selectedYear) {
      return new Date(selectedYear, selectedMonth - 1, 1)
    }
    const baseDate = draft.base?.dueDate ? new Date(draft.base.dueDate) : new Date()
    return isNaN(baseDate.getTime()) ? new Date() : baseDate
  }, [selectedMonth, selectedYear, draft.base?.dueDate])

  const handleMonthSelect = (date: Date) => {
    const nextVal = {
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    }
    onChange?.(nextVal)
    updateDraft({
      CHOOSE_CARD_INVOICE: nextVal,
    })
  }

  const activeMonthIndex = selectedMonth ? selectedMonth - 1 : selectedDate.getMonth()
  const activeYear = selectedYear ?? selectedDate.getFullYear()
  const activeMonthName = PT_BR_MONTHS[activeMonthIndex] ?? ""

  return (
    <div className={cn("flex flex-col items-center gap-4 w-full max-w-sm mx-auto", className)}>
      <Card className="w-full bg-card/60 backdrop-blur-xs border-border/60 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-3 px-4 pt-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="size-8 rounded-full flex items-center justify-center shrink-0 border"
              style={{
                backgroundColor: selectedCard?.color ? `${selectedCard.color}15` : undefined,
                borderColor: selectedCard?.color ? `${selectedCard.color}40` : undefined,
                color: selectedCard?.color ?? undefined,
              }}
            >
              <CreditCard className="size-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <CardTitle className="text-xs font-semibold truncate leading-tight">
                {selectedCard?.name ?? "Cartão de Crédito"}
              </CardTitle>
              <CardDescription className="text-[11px] truncate leading-tight">
                {selectedCard?.subtitle ?? "Fatura do cartão"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col items-center justify-center p-4 pt-1">
          <MonthPicker
            selectedMonth={selectedDate}
            onMonthSelect={handleMonthSelect}
            callbacks={{
              monthLabel: (m) => PT_BR_MONTHS_SHORT[m.number] ?? m.name,
            }}
            className="w-full max-w-[280px]"
          />

          <p className="text-[11px] text-muted-foreground text-center mt-3">
            A compra será vinculada à fatura de{" "}
            <strong className="text-foreground font-medium">
              {activeMonthName} de {activeYear}
            </strong>.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
