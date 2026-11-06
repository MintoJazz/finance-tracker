"use client"

import * as React from "react"
import { Equal, Scale, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SplitGroupMode } from "@/modules/operations/models/intents/split-group.schema"
import { useOperationWizard } from "@/modules/operations/ui/components/operation-wizard/context"

export interface GroupSharesEditorProps {
  mode?: SplitGroupMode
  onChangeMode: (mode: SplitGroupMode) => void
}

export function GroupSharesEditor({
  mode = "EQUAL",
  onChangeMode,
}: GroupSharesEditorProps) {
  const { lookups, draft, updateDraft } = useOperationWizard()

  const selectedGroups = React.useMemo(() => {
    const selectedIds = new Set(draft.DEMO_REIMBURSEMENT?.targetIds ?? [])
    return lookups.reimbursementTargets.filter(
      (t) => t.type === "GROUP" && selectedIds.has(t.id)
    )
  }, [lookups.reimbursementTargets, draft.DEMO_REIMBURSEMENT?.targetIds])

  const weights = draft.DEMO_SPLIT_GROUP?.memberWeights ?? {}

  const handleModeSelect = (nextMode: SplitGroupMode) => {
    onChangeMode(nextMode)
    updateDraft({
      DEMO_SPLIT_GROUP: {
        mode: nextMode,
      },
    })
  }

  const handleMemberWeight = (memberId: string, weight: number) => {
    updateDraft({
      DEMO_SPLIT_GROUP: {
        mode: "WEIGHTS",
        memberWeights: {
          ...weights,
          [memberId]: weight,
        },
      },
    })
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Pills de Modo de Rateio */}
      <div
        data-vaul-no-drag=""
        data-swipe-ignore=""
        data-base-ui-swipe-ignore=""
        style={{ touchAction: "pan-x" }}
        className="flex items-center gap-2 overflow-x-auto py-0.5 no-scrollbar select-none"
      >
        <button
          type="button"
          onClick={() => handleModeSelect("EQUAL")}
          aria-pressed={mode === "EQUAL"}
          className={cn(
            "inline-flex items-center gap-2 h-9 px-3 rounded-xl border text-xs font-semibold shrink-0 transition-all cursor-pointer",
            mode === "EQUAL"
              ? "border-primary bg-primary/12 text-primary"
              : "border-border/70 bg-card/50 text-muted-foreground hover:text-foreground"
          )}
        >
          <Equal className="size-3.5" />
          <span>Divisão Igualitária</span>
        </button>

        <button
          type="button"
          onClick={() => handleModeSelect("WEIGHTS")}
          aria-pressed={mode === "WEIGHTS"}
          className={cn(
            "inline-flex items-center gap-2 h-9 px-3 rounded-xl border text-xs font-semibold shrink-0 transition-all cursor-pointer",
            mode === "WEIGHTS"
              ? "border-primary bg-primary/12 text-primary"
              : "border-border/70 bg-card/50 text-muted-foreground hover:text-foreground"
          )}
        >
          <Scale className="size-3.5" />
          <span>Por Cotas / Pesos</span>
        </button>
      </div>

      {/* Lista horizontal de membros dos grupos selecionados */}
      {selectedGroups.map((group) => (
        <div
          key={group.id}
          className="rounded-xl border border-border/70 bg-muted/15 p-2.5 space-y-2"
        >
          <div className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
              <Users className="size-3.5 text-primary" />
              {group.name}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {group.members?.length ?? 0} integrantes
            </span>
          </div>

          <div
            data-vaul-no-drag=""
            data-swipe-ignore=""
            data-base-ui-swipe-ignore=""
            style={{ touchAction: "pan-x" }}
            className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar select-none"
          >
            {(group.members ?? []).map((member) => {
              const currentWeight = weights[member.id] ?? 1
              return (
                <div
                  key={member.id}
                  data-vaul-no-drag=""
                  className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-card/70 px-2.5 py-1.5 shrink-0 min-w-[140px]"
                >
                  <span className="text-xs font-medium text-foreground truncate">
                    {member.name}
                  </span>
                  {mode === "WEIGHTS" ? (
                    <div className="flex items-center gap-1">
                      {[1, 2, 3].map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => handleMemberWeight(member.id, w)}
                          className={cn(
                            "size-6 rounded text-[11px] font-bold transition-colors cursor-pointer",
                            currentWeight === w
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {w}x
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] font-mono text-muted-foreground">
                      1/{group.members?.length ?? 1}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
