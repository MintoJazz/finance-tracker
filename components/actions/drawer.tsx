"use client"

import * as React from "react"
import Link from "next/link"
import type { RowData } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
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
        <div className="max-h-[calc(88dvh-12px)] overflow-y-auto overscroll-contain px-4 py-3 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <div className="flex flex-col gap-3">
            {header && (
              <div className="pb-1">
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
                  className={`grid gap-1 ${groupIndex > 0 ? "mt-3 border-t border-border pt-3" : ""}`}
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
                        className={`h-11 w-full justify-start px-2.5 py-2 text-left ${action.variant === "destructive"
                          ? "text-destructive hover:text-destructive bg-destructive/10 hover:bg-destructive/20"
                          : ""
                          }`}
                        onClick={(e) => {
                          if (action.confirmTitle) {
                            e.preventDefault()
                            setConfirmation(action)
                          } else if (!action.href) {
                            runAction(action)
                          }
                        }}
                      >
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-secondary">
                          {renderActionIcon(action.icon, "h-4 w-4")}
                        </span>
                        <span className="block text-sm font-medium truncate">
                          {action.label}
                        </span>
                      </Button>
                    )

                    if (action.confirmTitle) {
                      return (
                        <React.Fragment key={action.id ?? actionIndex}>
                          {actionContent}
                        </React.Fragment>
                      )
                    }

                    return (
                      <DrawerClose
                        key={action.id ?? actionIndex}
                        render={
                          action.href ? (
                            <Link href={action.href}>{actionContent}</Link>
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
                    )
                  })}
                </div>
              ))}
            </div>
            {footer && <div className="border-t border-border pt-3">{footer}</div>}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
