"use client"

import * as React from "react"
import * as LucideNamespace from "lucide-react"
import { Check, Plus, Sparkles, type LucideProps } from "lucide-react"
import { cn } from "@/lib/utils"
import type { OperationIntentKey } from "../../../models/operation-input.schema"
import { useOperationWizard } from "../operation-wizard/context"

type IconComponentType = React.ComponentType<LucideProps>

const LUCIDE_ICONS_MAP: Record<string, IconComponentType> =
  (
    LucideNamespace as unknown as {
      icons?: Record<string, IconComponentType>
    }
  ).icons ?? {}

export interface IntentPillsBarProps {
  /** ID da etapa lógica onde esta barra de pills está acoplada */
  stepId: string
  className?: string
}

/**
 * Barra horizontal de pills com scroll lateral (`overflow-x-auto no-scrollbar`, `touchAction: "pan-x"`).
 * Renderiza todas as intenções elegíveis oferecidas na etapa `stepId` (e as já ativas ali).
 * Oculta-se automaticamente quando não há nenhuma intenção elegível naquele passo.
 */
export function IntentPillsBar({ stepId, className }: IntentPillsBarProps) {
  const { getOfferedIntentsForStep, activeIntents, toggleIntent } =
    useOperationWizard()

  const offered = getOfferedIntentsForStep(stepId)

  if (offered.length === 0) {
    return null
  }

  return (
    <div
      data-vaul-no-drag=""
      data-swipe-ignore=""
      data-base-ui-swipe-ignore=""
      style={{ touchAction: "pan-x" }}
      className={cn(
        "flex items-center gap-1.5 overflow-x-auto py-1 px-0.5 no-scrollbar select-none",
        className
      )}
      aria-label="Opções adicionais da etapa"
    >
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground shrink-0 pr-1">
        <Sparkles className="size-3 text-primary/80" />
        Opções:
      </span>

      {offered.map((intentDef) => {
        const key = intentDef.key as OperationIntentKey
        const isActive = activeIntents.includes(key)
        const IconComp =
          (intentDef.offer?.icon && LUCIDE_ICONS_MAP[intentDef.offer.icon]) ||
          (isActive ? Check : Plus)

        return (
          <button
            key={key}
            type="button"
            data-vaul-no-drag=""
            data-swipe-ignore=""
            data-base-ui-swipe-ignore=""
            onMouseDown={(e) => e.preventDefault()}
            onPointerDown={(e) => e.preventDefault()}
            onClick={() => toggleIntent(key)}
            aria-pressed={isActive}
            title={intentDef.offer?.description}
            style={{ touchAction: "manipulation" }}
            className={cn(
              "inline-flex items-center gap-1.5 h-7 rounded-full border px-2.5 text-xs font-medium shrink-0 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring select-none touch-manipulation",
              isActive
                ? "border-primary bg-primary/12 text-primary font-semibold shadow-2xs"
                : "border-dashed border-border bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/60 hover:border-border"
            )}
          >
            {isActive ? (
              <Check className="size-3.5 shrink-0 text-primary" />
            ) : (
              <IconComp className="size-3.5 shrink-0" />
            )}
            <span>{intentDef.offer?.label ?? key}</span>
          </button>
        )
      })}
    </div>
  )
}

