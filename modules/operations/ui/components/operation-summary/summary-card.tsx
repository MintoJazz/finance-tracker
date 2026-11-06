"use client"

import * as React from "react"
import * as LucideNamespace from "lucide-react"
import { CircleDot, Pencil, type LucideIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { SummaryCard } from "@/modules/operations/application/summary/types"
import { SummaryRowView } from "./summary-row"
import { SummarySectionView } from "./summary-section"

type IconComponentType = LucideIcon

const LUCIDE_ICONS_MAP: Record<string, IconComponentType> =
  (
    LucideNamespace as unknown as {
      icons?: Record<string, IconComponentType>
    }
  ).icons ?? {}

function resolveLucideIcon(iconName?: string | null): IconComponentType {
  if (!iconName) return CircleDot
  if (LUCIDE_ICONS_MAP[iconName]) return LUCIDE_ICONS_MAP[iconName]
  const pascal = iconName.charAt(0).toUpperCase() + iconName.slice(1)
  return LUCIDE_ICONS_MAP[pascal] ?? CircleDot
}

export interface SummaryCardProps {
  card: SummaryCard
  onEdit?: (stepId: string) => void
  className?: string
}

export function SummaryCardView({ card, onEdit, className }: SummaryCardProps) {
  const IconComp = resolveLucideIcon(card.icon)

  const badgeStyle =
    card.badge?.tone === "danger"
      ? "border-destructive/30 bg-destructive/10 text-destructive"
      : card.badge?.tone === "success"
        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        : "border-primary/30 bg-primary/10 text-primary"

  return (
    <div
      className={cn(
        "rounded-xl border border-border/70 bg-card/60 backdrop-blur-xs divide-y divide-border/50 overflow-hidden shadow-xs",
        className
      )}
    >
      {/* Cabeçalho do Card */}
      <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-muted/20">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={cn(
              "size-7 rounded-lg flex items-center justify-center shrink-0",
              card.badge?.tone === "danger"
                ? "bg-destructive/10 text-destructive"
                : card.badge?.tone === "success"
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-primary/10 text-primary"
            )}
          >
            <IconComp className="size-4 shrink-0" />
          </div>
          <span className="text-xs sm:text-sm font-semibold text-foreground truncate">
            {card.title}
          </span>
        </div>

        {card.badge && (
          <Badge
            variant="outline"
            className={cn("text-[10px] py-0 px-1.5 h-4.5 font-semibold shrink-0", badgeStyle)}
          >
            {card.badge.label}
          </Badge>
        )}
      </div>

      {/* Widget Visual (ex.: Criar Categoria / Criar Subcategoria) */}
      {card.visualItem && (
        <div className="flex items-center justify-between gap-3 px-3.5 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              style={{
                backgroundColor: `${card.visualItem.color || "#10B981"}1A`,
                borderColor: `${card.visualItem.color || "#10B981"}44`,
                color: card.visualItem.color || "#10B981",
              }}
              className="size-10 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs"
            >
              {React.createElement(resolveLucideIcon(card.visualItem.icon), {
                className: "size-5",
              })}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-foreground truncate">
                {card.visualItem.title}
              </span>
              {card.visualItem.subtitle && (
                <span className="text-xs text-muted-foreground truncate">
                  {card.visualItem.subtitle}
                </span>
              )}
            </div>
          </div>

          {card.visualItem.stepId && onEdit && (
            <button
              type="button"
              onClick={() => onEdit(card.visualItem!.stepId!)}
              className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted/50 cursor-pointer shrink-0"
              aria-label={`Editar ${card.title}`}
            >
              <Pencil className="size-4" />
            </button>
          )}
        </div>
      )}

      {/* Linhas regulares */}
      {card.rows && card.rows.length > 0 && (
        <div className="divide-y divide-border/40">
          {card.rows.map((row) => (
            <SummaryRowView key={row.id} row={row} onEdit={onEdit} />
          ))}
        </div>
      )}

      {/* Seções agrupadas (ex.: múltiplos grupos selecionados) */}
      {card.sections && card.sections.length > 0 && (
        <div className="space-y-1 py-1">
          {card.sections.map((section) => (
            <SummarySectionView
              key={section.id}
              section={section}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}

      {/* Rodapé do Card */}
      {card.footer && card.footer.length > 0 && (
        <div className="divide-y divide-border/40 bg-muted/30">
          {card.footer.map((row) => (
            <SummaryRowView key={row.id} row={row} onEdit={onEdit} isFooter />
          ))}
        </div>
      )}
    </div>
  )
}

