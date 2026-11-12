"use client"

import * as React from "react"
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ReceiptText,
} from "lucide-react"
import { Widget, WidgetList } from "@/components/form/widget"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatMoney } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import type { CycleView } from "@/modules/cycles/models/obligation-cycle.schema"
import { CycleItemRow } from "./cycle-item-row"
import { groupCycles } from "./cycle-view-model"

export interface CyclePanelDesktopProps {
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

export function CyclePanelDesktop({
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
}: CyclePanelDesktopProps) {
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
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-[1fr_260px] gap-4 w-full items-stretch",
        className
      )}
    >
      {/* Coluna Esquerda: Lista de Ciclos Agrupados */}
      <div className="flex flex-col justify-between h-[340px] space-y-1.5 min-w-0">
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
            Carregar ciclos anteriores
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
            className="divide-y divide-border/50 rounded-xl border border-border/70 bg-card/40 h-full overflow-y-auto no-scrollbar"
          >
            {cycles.length === 0 ? (
              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                {loading ? "Carregando ciclos..." : "Nenhum ciclo encontrado."}
              </div>
            ) : (
              <>
                {/* Seção: Vencidos */}
                {groups.overdue.length > 0 && (
                  <div>
                    <div className="sticky top-0 z-10 flex items-center justify-between px-3 py-1 bg-muted/80 backdrop-blur-xs border-b border-border/50 text-xs font-semibold">
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
                          className="h-5 px-2 text-[11px] text-muted-foreground hover:text-foreground"
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
                          onToggle={onToggleCycle}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Seção: A vencer */}
                {groups.upcoming.length > 0 && (
                  <div>
                    <div className="sticky top-0 z-10 flex items-center px-3 py-1 bg-muted/80 backdrop-blur-xs border-b border-border/50 text-xs font-semibold text-muted-foreground">
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
                      className="flex items-center justify-between w-full px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground bg-muted/20 hover:bg-muted/40 rounded-lg transition-colors border border-dashed border-border/40"
                    >
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5 text-muted-foreground" />
                        {showSettled
                          ? "Ocultar ciclos liquidados"
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
            Carregar próximos ciclos
          </Button>
        )}
      </div>

      {/* Coluna Direita: Recibo / Resumo da Quitação */}
      <div className="w-full md:w-[260px] flex flex-col h-[340px]">
        <div className="bg-card/70 backdrop-blur-xs border border-border/60 rounded-xl shadow-xs flex flex-col justify-between h-full overflow-hidden">
          {/* Zona 1: Topo (Cabeçalho fixo) */}
          <div className="pb-2 px-3.5 pt-3 border-b border-border/40 shrink-0">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <ReceiptText className="size-3.5 text-primary" />
              <span>Resumo da Quitação</span>
            </div>
            {contractName && (
              <p
                className="text-[11px] text-muted-foreground truncate mt-0.5"
                title={contractName}
              >
                {contractName}
              </p>
            )}
          </div>

          {/* Zona 2: Corpo (Lista de selecionados com flex-1) */}
          <div className="flex-1 min-h-0 flex flex-col px-3.5 py-2.5 overflow-hidden">
            {selectedCycles.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-4 px-1">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Marque um ou mais ciclos ao lado para compor o valor da operação.
                </p>
              </div>
            ) : (
              <div className="flex-1 min-h-0 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground shrink-0">
                  <span>Ciclos selecionados</span>
                  <Badge
                    variant="secondary"
                    className="text-[10px] py-0 px-1.5 h-4 font-semibold tabular-nums"
                  >
                    {selectedCycles.length}
                  </Badge>
                </div>
                <div className="space-y-1.5 overflow-y-auto max-h-44 pr-1 no-scrollbar flex-1">
                  {selectedCycles.map((cycle) => (
                    <div
                      key={cycle.referenceDate}
                      className="flex items-center justify-between gap-2 text-xs py-0.5"
                    >
                      <span
                        className="text-muted-foreground truncate"
                        title={cycle.label}
                      >
                        {cycle.label}
                      </span>
                      <span className="font-medium tabular-nums text-foreground shrink-0">
                        {formatMoney(cycle.outstanding)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Zona 3: Rodapé da Sidebar (Ancorado embaixo) */}
          <div className="mt-auto border-t border-border/40 bg-muted/10 px-3.5 pb-3.5 pt-2.5 shrink-0">
            <div className="text-[11px] text-muted-foreground font-medium">
              Total a liquidar
            </div>
            <div className="text-2xl font-bold tabular-nums tracking-tight text-foreground mt-0.5">
              {formatMoney(totalAmount)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
