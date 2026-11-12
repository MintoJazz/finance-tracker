"use client"

import * as React from "react"
import { AlertCircle, Calendar } from "lucide-react"
import {
  WidgetCheckbox,
  WidgetIcon,
  WidgetItem,
} from "@/components/form/widget"
import { Badge } from "@/components/ui/badge"
import { formatMoney } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import type { CycleView } from "@/modules/cycles/models/obligation-cycle.schema"
import {
  toCycleRowVM,
  type CycleRowVM,
} from "./cycle-view-model"

export interface CycleItemRowProps {
  cycle: CycleView | CycleRowVM
  isSelected?: boolean
  showUnrecordedBadge?: boolean
  density?: "comfortable" | "compact"
  onToggle: (cycle: CycleView) => void
}

export function CycleItemRow({
  cycle,
  isSelected,
  showUnrecordedBadge = false,
  density = "comfortable",
  onToggle,
}: CycleItemRowProps) {
  const vm: CycleRowVM = React.useMemo(() => {
    if ("dueRelativeText" in cycle) {
      return cycle
    }
    return toCycleRowVM(cycle)
  }, [cycle])

  return (
    <WidgetItem
      value={vm.referenceDate}
      disabled={vm.disabled}
      onClick={() => onToggle(vm.raw)}
      className={cn(
        "px-2.5 gap-2.5 transition-colors select-none",
        density === "compact" ? "py-1.5" : "py-2",
        vm.isSettled && "opacity-60 cursor-not-allowed bg-muted/10",
        isSelected && "bg-primary/5 border-l-2 border-l-primary"
      )}
    >
      {/* Ícone Semântico */}
      <WidgetIcon
        icon={<Calendar className="size-4 shrink-0" />}
        className={cn(
          "size-8 rounded-lg shrink-0 border transition-colors",
          vm.isSettled
            ? "border-border/30 bg-muted/30 text-muted-foreground"
            : vm.tone === "overdue"
              ? "border-destructive/30 bg-destructive/10 text-destructive"
              : "border-border/40 bg-muted/70 text-foreground"
        )}
      />

      {/* Conteúdo central: 2 Linhas */}
      <div className="flex flex-col min-w-0 flex-1 justify-center gap-0.5 overflow-hidden">
        {/* Linha 1: Mês à esquerda, e se parcial pill ao lado */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={cn(
              "text-xs sm:text-sm font-semibold text-foreground truncate leading-tight",
              vm.isSettled && "line-through text-muted-foreground"
            )}
          >
            {vm.label}
          </span>
          {vm.isPartial && (
            <Badge
              variant="outline"
              className="text-[10px] py-0 px-1 border-amber-500/40 text-amber-500 font-medium shrink-0"
            >
              Parcial
            </Badge>
          )}
          {showUnrecordedBadge && vm.isUnrecorded && (
            <Badge
              variant="outline"
              className="text-[10px] py-0 px-1 border-amber-500/40 text-amber-500 shrink-0 flex items-center gap-0.5"
            >
              <AlertCircle className="size-2.5" />
              Sem lançamento
            </Badge>
          )}
        </div>

        {/* Linha 2: Data e contexto relativo com cor semântica */}
        <p
          className={cn(
            "text-[11px] sm:text-xs truncate leading-tight",
            vm.isSettled
              ? "text-muted-foreground line-through"
              : vm.tone === "overdue"
                ? "text-destructive font-medium"
                : "text-muted-foreground"
          )}
        >
          {vm.dueLabel}
        </p>
      </div>

      {/* Lado Direito: Valor + Checkbox */}
      <div className="flex items-center gap-2 shrink-0 pl-1">
        <span
          className={cn(
            "text-xs sm:text-sm font-semibold tabular-nums text-foreground",
            vm.isSettled && "line-through text-muted-foreground font-normal text-xs"
          )}
        >
          {formatMoney(vm.amount)}
        </span>
        <WidgetCheckbox />
      </div>
    </WidgetItem>
  )
}
