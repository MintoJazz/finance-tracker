"use client"

import * as React from "react"
import Link from "next/link"
import type { RowData } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer"
import type {
  DataTableRowActionsProps,
  RowLike,
  RowAction,
} from "@/types/actions.types"
import { renderActionIcon } from "./menu"

export interface ActionsDrawerProps<
  TData extends RowData = any,
  TContext = any,
> extends Omit<DataTableRowActionsProps<TData, TContext>, "trigger"> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactElement | null;
}

export function ActionsDrawer<
  TData extends RowData = any,
  TContext = any,
>({
  row,
  actions,
  actionGroups,
  context,
  onAction,
  trigger,
  open,
  onOpenChange,
  children,
  label,
  header,
  footer,
  contentClassName,
}: ActionsDrawerProps<TData, TContext>) {
  const [confirmation, setConfirmation] = React.useState<RowAction<TData, TContext> | null>(null)

  const normalizedRow = React.useMemo(() => {
    if (!row) return undefined
    return typeof row === "object" && "original" in row
      ? (row as RowLike<TData>)
      : ({ original: row as TData } as RowLike<TData>)
  }, [row])

  const rawGroups = React.useMemo(() => {
    if (actionGroups && actionGroups.length > 0) return actionGroups
    if (actions && actions.length > 0) return [actions]
    return []
  }, [actionGroups, actions])

  const visibleGroups = React.useMemo(
    () => {
      if (!normalizedRow) return []
      return rawGroups
        .map((group) =>
          group.filter((action) => !action.hidden?.(normalizedRow, context))
        )
        .filter((group) => group.length > 0)
    },
    [rawGroups, normalizedRow, context]
  )

  if (visibleGroups.length === 0 && !header && !footer && !children) return null

  const defaultTrigger = (
    <Button
      variant="ghost"
      className="h-8 w-8 p-0"
      onClick={(e) => e.stopPropagation()}
    >
      <span className="sr-only">Abrir menu</span>
      <MoreHorizontal className="h-4 w-4" />
    </Button>
  )

  const runAction = (action: RowAction<TData, TContext>) => {
    action.onClick?.(normalizedRow!, context as TContext)
    onAction?.(action, normalizedRow!, context)
    setConfirmation(null)
    onOpenChange?.(false)
  }

  return (
    <Drawer
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) setConfirmation(null)
        onOpenChange?.(nextOpen)
      }}
      showSwipeHandle
    >
      {trigger !== null && (
        <DrawerTrigger render={trigger ?? defaultTrigger} />
      )}
      <DrawerContent
        className={contentClassName}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-h-[calc(88dvh-12px)] overflow-y-auto overscroll-contain px-3.5 pt-1.5 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <div className="flex flex-col gap-2.5">
            {header && (
              <div className="px-0.5 pb-0.5">
                {header}
              </div>
            )}
            {children}
            <div>
              {label && (
                <p className="px-2 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {label}
                </p>
              )}
              {visibleGroups.map((group, groupIndex) => (
                <div
                  className={cn(
                    "rounded-xl border border-border bg-card/60 backdrop-blur-xs overflow-hidden shadow-xs",
                    groupIndex > 0 && "mt-2"
                  )}
                  key={groupIndex}
                >
                  {group.map((action, actionIndex) => {
                    const isDisabled =
                      typeof action.disabled === "function"
                        ? action.disabled(normalizedRow!, context)
                        : action.disabled
                    const actionContent = (
                      <Button
                        variant="ghost"
                        disabled={isDisabled}
                        className={cn(
                          "h-11 w-full justify-start px-3.5 py-2 text-left rounded-none border-0 transition-colors",
                          action.variant === "destructive"
                            ? "text-destructive hover:text-destructive hover:bg-destructive/10"
                            : "text-foreground hover:bg-muted/60"
                        )}
                        onClick={(e) => {
                          if (action.confirmTitle) {
                            e.preventDefault()
                            setConfirmation(action)
                          } else if (!action.href) {
                            runAction(action)
                          }
                        }}
                      >
                        <span
                          className={cn(
                            "flex size-5 shrink-0 items-center justify-center mr-2.5",
                            action.variant === "destructive"
                              ? "text-destructive"
                              : "text-muted-foreground"
                          )}
                        >
                          {renderActionIcon(action.icon, "size-4")}
                        </span>
                        <span className="block text-sm font-medium truncate">
                          {action.label}
                        </span>
                      </Button>
                    )

                    const itemKey = action.id ?? `${groupIndex}-${actionIndex}`

                    return (
                      <React.Fragment key={itemKey}>
                        {actionIndex > 0 && <div className="h-px w-full bg-border" />}
                        {action.confirmTitle ? (
                          actionContent
                        ) : (
                          <DrawerClose
                            render={
                              action.href ? (
                                <Link href={action.href} className="block w-full">
                                  {actionContent}
                                </Link>
                              ) : (
                                actionContent
                              )
                            }
                            onClick={(e) => {
                              e.stopPropagation()
                              if (action.href) {
                                runAction(action)
                              }
                            }}
                          />
                        )}
                      </React.Fragment>
                    )
                  })}
                </div>
              ))}
            </div>
            {footer && <div className="border-t border-border pt-2.5">{footer}</div>}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
