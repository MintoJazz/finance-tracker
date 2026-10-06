"use client"

import * as React from "react"
import Link from "next/link"
import type { RowData } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type {
  ActionIcon,
  DataTableRowActionsProps,
  RowLike,
} from "@/types/actions.types"

export function renderActionIcon(
  icon?: ActionIcon | React.ReactNode,
  className?: string
): React.ReactNode {
  if (!icon) return null
  if (React.isValidElement(icon)) return icon
  if (
    typeof icon === "function" ||
    (typeof icon === "object" && icon !== null)
  ) {
    const IconComponent = icon as ActionIcon
    return <IconComponent className={className} />
  }
  return icon
}

export function DataTableRowActions<
  TData extends RowData = any,
  TContext = any,
>({
  row,
  actions,
  actionGroups,
  context,
  onAction,
  trigger,
  children,
  label,
  header,
  footer,
  side,
  align = "end",
  sideOffset = 4,
  contentClassName,
}: DataTableRowActionsProps<TData, TContext>) {
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

  if (visibleGroups.length === 0 && !header && !footer) return null

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={trigger ?? defaultTrigger}>
        {children}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side={side}
        align={align}
        sideOffset={sideOffset}
        className={contentClassName ?? "w-fit"}
        onClick={(e) => e.stopPropagation()}
      >
        {header && (
          <DropdownMenuGroup>
            <DropdownMenuLabel className="p-0 font-normal">
              {header}
            </DropdownMenuLabel>
          </DropdownMenuGroup>
        )}

        {visibleGroups.map((group, groupIndex) => (
          <React.Fragment key={groupIndex}>
            {(groupIndex > 0 || Boolean(header)) && <DropdownMenuSeparator />}
            <DropdownMenuGroup>
              {groupIndex === 0 && label && (
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  {label}
                </DropdownMenuLabel>
              )}
              {group.map((action, actionIndex) => {
                const showSeparator =
                  (action.separator || action.separatorBefore) &&
                  actionIndex > 0
                const isDisabled =
                  typeof action.disabled === "function"
                    ? action.disabled(normalizedRow!, context)
                    : action.disabled

                return (
                  <React.Fragment key={action.id ?? actionIndex}>
                    {showSeparator && <DropdownMenuSeparator />}
                    <DropdownMenuItem
                      variant={action.variant}
                      disabled={isDisabled}
                      render={
                        action.href ? <Link href={action.href} /> : undefined
                      }
                      onClick={() => {
                        action.onClick?.(normalizedRow!, context as TContext)
                        onAction?.(action, normalizedRow!, context)
                      }}
                      className={
                        action.variant === "destructive"
                          ? "text-destructive focus:text-destructive"
                          : undefined
                      }
                    >
                      {renderActionIcon(action.icon)}
                      <span>{action.label}</span>
                      {action.shortcut && (
                        <DropdownMenuShortcut>
                          {action.shortcut}
                        </DropdownMenuShortcut>
                      )}
                    </DropdownMenuItem>
                  </React.Fragment>
                )
              })}
            </DropdownMenuGroup>
          </React.Fragment>
        ))}

        {footer && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>{footer}</DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { DataTableRowActions as ActionsMenu }