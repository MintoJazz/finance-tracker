"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronRight, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ActionsDrawer } from "@/components/actions/drawer"
import { renderActionIcon } from "@/components/actions/menu"
import { useCurrentTitle } from "@/components/header/use-current-title"
import { cn } from "@/lib/utils"
import { useGlobalActionsContext } from "./context"
import type { GlobalAction } from "./types"
import { GLOBAL_ACTIONS_ROW } from "./utils"

const TONE_STYLES = {
  positive: {
    tile: "border-emerald-500/25 hover:bg-emerald-500/5",
    icon: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  negative: {
    tile: "border-destructive/25 hover:bg-destructive/5",
    icon: "bg-destructive/15 text-destructive",
  },
} as const

function FeaturedTile({
  action,
  onSelect,
}: {
  action: GlobalAction
  onSelect: () => void
}) {
  const tone = action.tone ? TONE_STYLES[action.tone] : null
  const className = cn(
    "flex flex-col items-center justify-center gap-2.5 rounded-xl border border-border bg-card/60 px-3 py-4 text-sm font-semibold shadow-xs transition-all active:scale-[0.98]",
    tone?.tile ?? "hover:bg-muted/60"
  )
  const content = (
    <>
      <span
        className={cn(
          "flex size-12 items-center justify-center rounded-full [&_svg]:size-6",
          tone?.icon ?? "bg-muted text-foreground"
        )}
      >
        {renderActionIcon(action.icon, "size-6")}
      </span>
      <span>{action.label}</span>
    </>
  )

  return action.href ? (
    <Link href={action.href} className={className} onClick={onSelect}>
      {content}
    </Link>
  ) : (
    <button
      type="button"
      disabled={action.disabled}
      className={className}
      onClick={() => {
        onSelect()
        void action.onClick?.()
      }}
    >
      {content}
    </button>
  )
}

function ListItem({
  action,
  primary,
  onSelect,
}: {
  action: GlobalAction
  primary: boolean
  onSelect: () => void
}) {
  const className = cn(
    "flex h-12 w-full items-center gap-3 px-3.5 text-left text-sm font-medium transition-colors hover:bg-muted/60 active:bg-muted disabled:opacity-50",
    action.variant === "destructive" && "text-destructive"
  )
  const content = (
    <>
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center [&_svg]:size-[18px]",
          primary ? "text-primary" : "text-foreground/70"
        )}
      >
        {renderActionIcon(action.icon, "size-[18px]")}
      </span>
      <span className="flex-1 truncate">{action.label}</span>
      {action.href && (
        <ChevronRight className="size-4 shrink-0 text-muted-foreground/60" />
      )}
    </>
  )

  return action.href ? (
    <Link href={action.href} className={className} onClick={onSelect}>
      {content}
    </Link>
  ) : (
    <button
      type="button"
      disabled={action.disabled}
      className={className}
      onClick={() => {
        onSelect()
        void action.onClick?.()
      }}
    >
      {content}
    </button>
  )
}

export function GlobalActionsMobile() {
  const { actions } = useGlobalActionsContext()
  const [open, setOpen] = React.useState(false)
  const title = useCurrentTitle()

  const featured = React.useMemo(
    () => actions.filter((action) => action.featured),
    [actions]
  )
  const list = React.useMemo(
    () => actions.filter((action) => !action.featured),
    [actions]
  )

  if (actions.length === 0) return null

  const close = () => setOpen(false)

  return (
    <div className="md:hidden">
      <ActionsDrawer
        row={GLOBAL_ACTIONS_ROW}
        open={open}
        onOpenChange={setOpen}
        header={
          featured.length > 0 ? (
            <div
              className={cn(
                "grid gap-2.5",
                featured.length === 1 ? "grid-cols-1" : "grid-cols-2"
              )}
            >
              {featured.map((action) => (
                <FeaturedTile key={action.id} action={action} onSelect={close} />
              ))}
            </div>
          ) : undefined
        }
        trigger={
          <Button
            size="icon"
            aria-label="Abrir ações"
            className="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 size-14 rounded-full shadow-lg"
          >
            <MoreVertical className="size-6" />
          </Button>
        }
      >
        {list.length > 0 && (
          <section className="mt-1 flex flex-col gap-2">
            <h3 className="px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {title ?? "Nesta tela"}
            </h3>
            <div className="overflow-hidden rounded-xl border border-border bg-card/60 shadow-xs">
              {list.map((action, index) => (
                <React.Fragment key={action.id}>
                  {index > 0 && <div className="h-px w-full bg-border" />}
                  <ListItem
                    action={action}
                    primary={index === 0}
                    onSelect={close}
                  />
                </React.Fragment>
              ))}
            </div>
          </section>
        )}
      </ActionsDrawer>
    </div>
  )
}
