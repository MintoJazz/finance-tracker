"use client"

import * as React from "react"
import { ChevronRight } from "lucide-react"
import { MoneyInput } from "@/components/form"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useWizard } from "@/components/wizard"
import { formatMoney } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import {
  CategoryIcon,
} from "@/modules/movements/ui/components/category-badge/category-icon"
import { getCategoryTheme } from "@/modules/movements/ui/components/category-badge"
import { useOperationWizard } from "../../../context"

export interface OperationAmountCardProps {
  value?: number
  onChange?: (val: number | undefined) => void
}

export function OperationAmountCard({
  value,
  onChange,
}: OperationAmountCardProps) {
  const { lookups, draft, updateDraft } = useOperationWizard()
  const { goTo } = useWizard()

  const selectedCustody = React.useMemo(() => {
    const custodyId = draft.base?.custodyBalanceId
    if (!custodyId) return undefined
    return lookups.custodies.find((c) => c.id === custodyId)
  }, [lookups.custodies, draft.base?.custodyBalanceId])

  const theme = React.useMemo(
    () => getCategoryTheme(selectedCustody?.color),
    [selectedCustody?.color]
  )

  const handleChange = (val: number | undefined) => {
    onChange?.(val)
    updateDraft({
      base: {
        amount: val,
      },
    })
  }

  const availableInfo = React.useMemo(() => {
    if (!selectedCustody || typeof selectedCustody.balanceCents !== "number") {
      return null
    }

    const isCredit = selectedCustody.type === "CREDIT"
    return {
      label: isCredit ? "Limite disponível" : "Saldo disponível",
      cents: selectedCustody.balanceCents,
    }
  }, [selectedCustody])

  const defaultIcon =
    selectedCustody?.type === "CREDIT"
      ? "CreditCard"
      : selectedCustody?.type === "RESERVE"
        ? "PiggyBank"
        : "Wallet"

  return (
    <div className="w-full max-w-sm mx-auto py-1">
      <Card className="border-border/70 shadow-xs bg-card/70">
        {/* Cabeçalho do Meio de Pagamento */}
        <CardHeader className="flex flex-row items-center justify-between gap-2 px-3.5 py-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={cn(
                "size-7 rounded-md shrink-0 flex items-center justify-center border transition-colors",
                theme.palette
                  ? cn(
                      theme.palette.bg,
                      theme.palette.text,
                      theme.palette.border ?? "border-border/40"
                    )
                  : "border-border/40 bg-muted text-foreground"
              )}
              style={theme.style}
            >
              <CategoryIcon
                name={selectedCustody?.icon ?? defaultIcon}
                className="size-3.5 shrink-0"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <CardTitle className="text-xs sm:text-sm font-semibold truncate leading-tight">
                {selectedCustody?.name ?? "Meio de pagamento"}
              </CardTitle>
              <CardDescription className="text-[11px] truncate leading-tight">
                {selectedCustody?.subtitle ?? "Não selecionado"}
              </CardDescription>
            </div>
          </div>
          <button
            type="button"
            onClick={() => goTo("base.custody")}
            className="inline-flex items-center gap-0.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0 px-2 py-1 rounded-md hover:bg-muted cursor-pointer"
          >
            <span>Alterar</span>
            <ChevronRight className="size-3" />
          </button>
        </CardHeader>

        {/* Input de Valor Centralizado e Compacto */}
        <CardContent className="flex flex-col items-center justify-center gap-1.5 py-5 px-4">
          <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase select-none">
            Digite o valor
          </span>
          <div className="w-full flex items-center justify-center">
            <MoneyInput
              value={value}
              onChange={handleChange}
              autoFocus
              className="w-full text-center text-3xl font-bold tracking-tight font-mono tabular-nums text-foreground bg-transparent border-0 outline-none focus:outline-none focus:ring-0 placeholder:text-muted-foreground/40"
            />
          </div>
        </CardContent>

        {/* Rodapé com Saldo ou Limite Disponível */}
        {availableInfo && (
          <CardFooter className="flex items-center justify-between px-3.5 py-2 text-[11px]">
            <span className="text-muted-foreground">{availableInfo.label}</span>
            <span className="font-semibold text-foreground font-mono tabular-nums">
              {formatMoney(availableInfo.cents)}
            </span>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
