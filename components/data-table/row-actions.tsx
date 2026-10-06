// components/data-table/row-actions.tsx
"use client"

import * as React from "react"
import type { Row } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { RowAction } from "./types"

interface DataTableRowActionsProps<TData, TContext> {
  row: Row<TData>
  actions: RowAction<TData, TContext>[]
  context: TContext
}

export function DataTableRowActions<TData, TContext>({
  row,
  actions,
  context,
}: DataTableRowActionsProps<TData, TContext>) {
  const visibleActions = actions.filter((action) => !action.hidden?.(row, context))
  if (!visibleActions.length) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          />
        }
      >
        <span className="sr-only">Abrir menu</span>
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
        </DropdownMenuGroup>
        {visibleActions.map((action, index) => {
          const itemKey = typeof action.label === "string" ? action.label : `action-${index}`
          return (
            <div key={itemKey}>
              {action.separator && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  void action.onClick?.(row, context)
                }}
                className={action.variant === "destructive" ? "text-destructive focus:text-destructive" : ""}
              >
                {action.icon ? (
                  React.isValidElement(action.icon) ? (
                    <span className="mr-2">{action.icon}</span>
                  ) : (
                    (() => {
                      const IconComponent = action.icon as React.ElementType
                      return <IconComponent className="mr-2 h-4 w-4" />
                    })()
                  )
                ) : null}
                {action.label}
              </DropdownMenuItem>
            </div>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}