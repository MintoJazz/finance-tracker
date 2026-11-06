"use client"

import * as React from "react"
import { Code2, Layers, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ViewPort } from "@/types/adaptive.types"
import {
  buildViewportSteps,
  useOperationWizard,
} from "../components/operation-wizard"

export interface OperationInspectorPanelProps {
  activeViewport: ViewPort
}

export function OperationInspectorPanel({
  activeViewport,
}: OperationInspectorPanelProps) {
  const {
    logicalSteps,
    activeIntents,
    availableIntents,
    draft,
    prunedPayload,
    currentViewportStepId,
    toggleIntent,
  } = useOperationWizard()

  const viewportSteps = React.useMemo(
    () => buildViewportSteps(logicalSteps, activeViewport),
    [logicalSteps, activeViewport]
  )

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border/70 bg-card/50 p-4 text-xs">
      {/* 1. Etapas Lógicas Ativas (resolveSteps) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
            <Layers className="size-3.5 text-primary" />
            Etapas Lógicas Ativas ({logicalSteps.length})
          </span>
          <span className="text-[11px] text-muted-foreground font-mono">
            resolveSteps()
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {logicalSteps.map((step) => {
            const isCurrentLogical =
              currentViewportStepId === step.id ||
              currentViewportStepId.startsWith(`${step.id}.`)
            return (
              <div
                key={step.id}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 font-mono text-[11px]",
                  isCurrentLogical
                    ? "border-primary bg-primary/12 text-primary font-semibold"
                    : "border-border/60 bg-muted/30 text-muted-foreground"
                )}
              >
                <span className="rounded bg-background/80 px-1 py-0.2 text-[10px] font-bold">
                  {step.order}
                </span>
                <span>{step.id}</span>
                {step.source !== "BASE" && (
                  <span className="text-[10px] text-primary">
                    [{step.source}]
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 2. Telas concretas geradas para o Viewport atual */}
      <div className="space-y-2 border-t border-border/50 pt-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-foreground">
            Telas no Viewport ({activeViewport.toUpperCase()}):{" "}
            {viewportSteps.length}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {activeViewport === "mobile"
              ? "Passos divididos"
              : "1 página por etapa lógica"}
          </span>
        </div>

        <div className="flex flex-wrap gap-1">
          {viewportSteps.map((vs, idx) => {
            const isCurrent = vs.id === currentViewportStepId
            return (
              <span
                key={vs.id}
                className={cn(
                  "rounded-md border px-2 py-0.5 text-[11px]",
                  isCurrent
                    ? "border-primary bg-primary/15 text-primary font-semibold"
                    : "border-border/50 bg-background/50 text-muted-foreground"
                )}
              >
                {idx + 1}. {vs.title} ({vs.id})
              </span>
            )
          })}
        </div>
      </div>

      {/* 3. Intenções Ativas vs Disponíveis */}
      <div className="space-y-2 border-t border-border/50 pt-3">
        <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
          <Sparkles className="size-3.5 text-primary" />
          Estado das Intenções
        </span>

        <div className="flex flex-wrap gap-1.5">
          {activeIntents.length > 0 ? (
            activeIntents.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => toggleIntent(key)}
                className="inline-flex items-center gap-1 rounded-full border border-primary bg-primary/12 px-2.5 py-0.5 text-[11px] font-semibold text-primary cursor-pointer"
              >
                ✓ {key}
              </button>
            ))
          ) : (
            <span className="text-[11px] text-muted-foreground">
              Nenhuma intenção ativa no momento.
            </span>
          )}
        </div>

        <div className="text-[11px] text-muted-foreground">
          Elegíveis globalmente agora:{" "}
          <span className="font-mono text-foreground">
            {availableIntents.length > 0 ? availableIntents.join(", ") : "—"}
          </span>
        </div>
      </div>

      {/* 4. Payload Podado vs Draft em Memória */}
      <div className="grid grid-cols-1 gap-2 border-t border-border/50 pt-3">
        <div>
          <span className="inline-flex items-center gap-1 font-semibold text-foreground mb-1">
            <Code2 className="size-3.5 text-emerald-500" />
            Payload Final Podado (enviado no submit)
          </span>
          <pre className="max-h-44 overflow-auto rounded-lg border border-border/60 bg-muted/40 p-2.5 font-mono text-[11px] leading-relaxed">
            {JSON.stringify(prunedPayload, null, 2)}
          </pre>
        </div>

        <details className="group">
          <summary className="cursor-pointer text-[11px] font-medium text-muted-foreground hover:text-foreground">
            Ver rascunho completo em memória (preserva fatias inativas)
          </summary>
          <pre className="mt-1.5 max-h-40 overflow-auto rounded-lg border border-border/60 bg-muted/20 p-2.5 font-mono text-[11px] leading-relaxed text-muted-foreground">
            {JSON.stringify(draft, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  )
}

