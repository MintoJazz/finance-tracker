"use client"

import * as React from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import type { ActionsMenuProps } from "@/types/actions"
import { cn } from "@/lib/utils"

export function ActionsMenu<T, TContext = unknown>({
  actions,
  data,
  context,
  actionContext,
  align = "end",
  className,
}: ActionsMenuProps<T, TContext>) {
  if (!actions || actions.length === 0) return null

  const activeContext = (context ?? actionContext) as TContext
  const row = { original: data }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className={cn("shrink-0 text-muted-foreground", className)}
            onClick={(e) => e.stopPropagation()}
          />
        }
      >
        <MoreHorizontal size={16} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} onClick={(e) => e.stopPropagation()}>
        {actions.map((action, i) => {
          if (action.hidden?.(row, activeContext)) return null

          return (
            <React.Fragment key={i}>
              {action.separator && <DropdownMenuSeparator />}
              <DropdownMenuItem
                disabled={
                  typeof action.disabled === "function"
                    ? action.disabled(row, activeContext)
                    : action.disabled
                }
                onClick={() => action.onClick(row, activeContext)}
              >
                {action.label}
              </DropdownMenuItem>
            </React.Fragment>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
