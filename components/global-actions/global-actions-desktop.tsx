"use client"

import * as React from "react"
import Link from "next/link"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ActionsMenu, renderActionIcon } from "@/components/actions/menu"
import { useGlobalActionsContext } from "./context"
import { GLOBAL_ACTIONS_ROW, toRowActions } from "./utils"

const MAX_PRIMARY_SLOTS = 3

export function GlobalActionsDesktop() {
  const { actions } = useGlobalActionsContext()
  const primary = actions.slice(0, MAX_PRIMARY_SLOTS)
  const overflow = actions.slice(MAX_PRIMARY_SLOTS)

  if (actions.length === 0) return null

  return (
    <div className="flex items-center gap-2">
      {primary.map((action) => (
        <Button
          key={action.id}
          variant="outline"
          size="sm"
          disabled={action.disabled}
          className="gap-1.5 text-xs"
          render={action.href ? <Link href={action.href} /> : undefined}
          nativeButton={!action.href}
          onClick={action.href ? undefined : () => action.onClick?.()}
        >
          {renderActionIcon(action.icon, "size-3.5")}
          <span>{action.label}</span>
        </Button>
      ))}

      {overflow.length > 0 && (
        <ActionsMenu
          row={GLOBAL_ACTIONS_ROW}
          actions={toRowActions(overflow)}
          trigger={
            <Button variant="outline" size="icon-sm" aria-label="Mais ações">
              <MoreHorizontal className="size-4" />
            </Button>
          }
        />
      )}
    </div>
  )
}
