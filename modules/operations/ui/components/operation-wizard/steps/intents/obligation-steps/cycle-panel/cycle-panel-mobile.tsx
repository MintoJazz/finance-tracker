"use client"

import * as React from "react"
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Widget, WidgetList } from "@/components/form/widget"
import { Button } from "@/components/ui/button"
import { formatMoney } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import type { CycleView } from "@/modules/cycles/models/obligation-cycle.schema"
import { CycleItemRow } from "./cycle-item-row"
import { groupCycles } from "./cycle-view-model"

export interface CyclePanelMobileProps {
  contractName?: string
  cycles: CycleView[]
  selectedCycles: CycleView[]
  onToggleCycle: (cycle: CycleView) => void
  onToggleBatch?: (cycles: CycleView[], select: boolean) => void
  totalAmount: number
  loading: boolean
  hasPrev: boolean
  hasNext: boolean
  onLoadPrev: () => void
  onLoadNext: () => void
  className?: string
}

export function CyclePanelMobile({
  contractName,
  cycles,
  selectedCycles,
  onToggleCycle,
  onToggleBatch,
  totalAmount,
  loading,
  hasPrev,
  hasNext,
  onLoadPrev,
  onLoadNext,
  className,
}: CyclePanelMobileProps) {
  const [showSettled, setShowSettled] = React.useState(false)

  const selectedSet = React.useMemo(
    () => new Set(selectedCycles.map((c) => c.referenceDate)),
    [selectedCycles]
  )

  const groups = React.useMemo(() => groupCycles(cycles), [cycles])

  const isAllOverdueSelected = React.useMemo(() => {
    if (groups.overdue.length === 0) return false
    return groups.overdue.every((c) => selectedSet.has(c.referenceDate))
  }, [groups.overdue, selectedSet])

  const handleToggleAllOverdue = () => {
    if (!onToggleBatch) return
    const targetCycles = groups.overdue.map((v) => v.raw)
    onToggleBatch(targetCycles, !isAllOverdueSelected)
  }

  return (
    <div className={cn("flex flex-col w-full space-y-2 pb-1 min-h-0", className)}>
      {/* Topo Compacto: Nome do Contrato + Total Selecionado */}
      <div className="flex items-center justify-between px-1 text-xs text-muted-foreground font-medium gap-2">
        {contractName ? (
          <div className="truncate">
            Contrato: <span className="text-foreground font-semibold">{contractName}</span>
          </div>
        ) : (
          <span />
        )}
        {selectedCycles.length > 0 && (
          <div className="shrink-0 font-semibold tabular-nums text-foreground bg-muted/60 px-2 py-0.5 rounded-md text-[11px]">
            {selectedCycles.length} {selectedCycles.length === 1 ? "ciclo" : "ciclos"} · {formatMoney(totalAmount)}
          </div>
        )}
      </div>

      {/* Aviso único quando todos os ciclos em aberto não têm lançamentos */}
      {groups.allUnrecorded && (
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs shrink-0">
          <AlertCircle className="size-3.5 shrink-0" />
          <span className="truncate">
            Ciclos previstos sem lançamentos vinculados
          </span>
        </div>
      )}

      {hasPrev && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onLoadPrev}
          disabled={loading}
          className="w-full text-xs h-7 text-muted-foreground hover:text-foreground shrink-0"
        >
          <ChevronUp className="size-3.5 mr-1" />
          Anteriores
        </Button>
      )}

      <Widget
        multiple
        value={Array.from(selectedSet)}
        onChange={() => {}}
        className="w-full flex-1 min-h-0"
      >
        <WidgetList
          data-vaul-no-drag=""
          className="divide-y divide-border/50 rounded-xl border border-border/70 bg-card/40 max-h-[320px] overflow-y-auto overflow-x-hidden overscroll-contain no-scrollbar"
        >
          {cycles.length === 0 ? (
            <div className="flex h-28 w-full items-center justify-center text-xs text-muted-foreground">
              {loading ? "Carregando ciclos..." : "Nenhum ciclo encontrado."}
            </div>
          ) : (
            <>
              {/* Seção: Vencidos */}
              {groups.overdue.length > 0 && (
                <div>
                  <div className="sticky top-0 z-10 flex items-center justify-between px-2.5 py-1 bg-muted/80 backdrop-blur-xs border-b border-border/50 text-xs font-semibold">
                    <span className="text-destructive flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-destructive" />
                      Vencidos · {groups.overdue.length}
                    </span>
                    {onToggleBatch && groups.overdue.length >= 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={handleToggleAllOverdue}
                        className="h-5 px-1.5 text-[11px] text-muted-foreground hover:text-foreground"
                      >
                        {isAllOverdueSelected
                          ? "Desmarcar todos"
                          : "Selecionar todos"}
                      </Button>
                    )}
                  </div>
                  <div className="divide-y divide-border/40">
                    {groups.overdue.map((cycle) => (
                      <CycleItemRow
                        key={cycle.referenceDate}
                        cycle={cycle}
                        isSelected={selectedSet.has(cycle.referenceDate)}
                        showUnrecordedBadge={!groups.allUnrecorded}
                        density="compact"
                        onToggle={onToggleCycle}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Seção: A vencer */}
              {groups.upcoming.length > 0 && (
                <div>
                  <div className="sticky top-0 z-10 flex items-center px-2.5 py-1 bg-muted/80 backdrop-blur-xs border-b border-border/50 text-xs font-semibold text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-muted-foreground/60" />
                      A vencer · {groups.upcoming.length}
                    </span>
                  </div>
                  <div className="divide-y divide-border/40">
                    {groups.upcoming.map((cycle) => (
                      <CycleItemRow
                        key={cycle.referenceDate}
                        cycle={cycle}
                        isSelected={selectedSet.has(cycle.referenceDate)}
                        showUnrecordedBadge={!groups.allUnrecorded}
                        density="compact"
                        onToggle={onToggleCycle}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Seção: Liquidados (Colapsada por padrão) */}
              {groups.settled.length > 0 && (
                <div className="p-1">
                  <button
                    type="button"
                    onClick={() => setShowSettled((prev) => !prev)}
                    className="flex items-center justify-between w-full px-2 py-1 text-xs text-muted-foreground hover:text-foreground bg-muted/20 hover:bg-muted/40 rounded-lg transition-colors border border-dashed border-border/40"
                  >
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="size-3.5 text-muted-foreground" />
                      {showSettled
                        ? "Ocultar liquidados"
                        : `${groups.settled.length} ciclo${
                            groups.settled.length > 1 ? "s" : ""
                          } já liquidado${
                            groups.settled.length > 1 ? "s" : ""
                          }`}
                    </span>
                    {showSettled ? (
                      <ChevronUp className="size-3.5" />
                    ) : (
                      <ChevronDown className="size-3.5" />
                    )}
                  </button>

                  {showSettled && (
                    <div className="mt-1 divide-y divide-border/40 rounded-lg border border-border/30 overflow-hidden">
                      {groups.settled.map((cycle) => (
                        <CycleItemRow
                          key={cycle.referenceDate}
                          cycle={cycle}
                          isSelected={false}
                          density="compact"
                          onToggle={onToggleCycle}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </WidgetList>
      </Widget>

      {hasNext && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onLoadNext}
          disabled={loading}
          className="w-full text-xs h-7 text-muted-foreground hover:text-foreground shrink-0"
        >
          <ChevronDown className="size-3.5 mr-1" />
          Próximos
        </Button>
      )}
    </div>
  )
}
