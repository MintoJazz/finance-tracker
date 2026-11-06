"use client"

import * as React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import {
  WidgetContext,
  WidgetItemContext,
  useWidgetContext,
  useWidgetItemContext,
} from "./context"
import type {
  WidgetCheckboxProps,
  WidgetContentProps,
  WidgetContextValue,
  WidgetExtraProps,
  WidgetIconProps,
  WidgetItemProps,
  WidgetListProps,
  WidgetProps,
  WidgetSubtitleProps,
  WidgetTitleProps,
  WidgetValue,
} from "./types"

export function Widget<T extends WidgetValue = WidgetValue>({
  children,
  className,
  disabled = false,
  ...props
}: WidgetProps<T>) {
  const isMultiple = Boolean(props.multiple)

  const isSelected = React.useCallback(
    (val: T): boolean => {
      if (props.multiple) {
        return (props.value ?? []).includes(val)
      }
      return props.value === val
    },
    [props.multiple, props.value]
  )

  const toggle = React.useCallback(
    (val: T) => {
      if (disabled) return

      if (props.multiple) {
        const current = props.value ?? []
        const exists = current.includes(val)
        const next = exists ? current.filter((item) => item !== val) : [...current, val]
        props.onChange?.(next)
      } else {
        if (props.value === val) {
          if (props.allowDeselect) {
            props.onChange?.(null)
          }
        } else {
          props.onChange?.(val)
        }
      }
    },
    [disabled, props]
  )

  const contextValue = React.useMemo(
    () => ({
      multiple: isMultiple,
      disabled,
      isSelected,
      toggle,
    }),
    [isMultiple, disabled, isSelected, toggle]
  )

  return (
    <WidgetContext.Provider value={contextValue as unknown as WidgetContextValue<unknown>}>
      <div
        data-slot="widget-root"
        className={cn("w-full min-w-0 overflow-x-hidden", className)}
      >
        {children}
      </div>
    </WidgetContext.Provider>
  )
}

export function WidgetList({ className, children, ...props }: WidgetListProps) {
  const { multiple } = useWidgetContext()

  return (
    <div
      data-slot="widget-list"
      role={multiple ? "group" : "radiogroup"}
      className={cn("flex flex-col w-full min-w-0 overflow-x-hidden", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function WidgetItem({
  value,
  disabled: itemDisabled,
  className,
  children,
  onClick,
  onKeyDown,
  ...props
}: WidgetItemProps) {
  const { isSelected, toggle, disabled: rootDisabled, multiple } = useWidgetContext()
  const selected = isSelected(value)
  const disabled = Boolean(rootDisabled || itemDisabled)

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return
    onClick?.(e)
    if (!e.defaultPrevented) {
      toggle(value)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return
    onKeyDown?.(e)
    if (e.defaultPrevented) return

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      toggle(value)
    }
  }

  const itemContextValue = React.useMemo(
    () => ({
      value,
      selected,
      disabled,
    }),
    [value, selected, disabled]
  )

  return (
    <WidgetItemContext.Provider value={itemContextValue}>
      <div
        data-slot="widget-item"
        role={multiple ? "checkbox" : "radio"}
        aria-checked={selected}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        data-state={selected ? "checked" : "unchecked"}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          "group/widget-item flex items-center justify-between gap-3 w-full min-w-0 max-w-full px-3 py-2.5 text-sm transition-colors cursor-pointer select-none outline-none hover:bg-muted/40 focus-visible:bg-muted/40",
          selected && "bg-muted/20",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </WidgetItemContext.Provider>
  )
}

export function WidgetIcon({ icon: Icon, className, children, ...props }: WidgetIconProps) {
  const renderIcon = () => {
    if (React.isValidElement(Icon)) {
      return Icon
    }
    if (
      typeof Icon === "function" ||
      (typeof Icon === "object" && Icon !== null && "$$typeof" in Icon)
    ) {
      const IconComponent = Icon as React.ComponentType<{ className?: string }>
      return <IconComponent className="size-4 shrink-0" />
    }
    return children
  }

  return (
    <div
      data-slot="widget-icon"
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-muted/40 text-muted-foreground group-hover/widget-item:text-foreground transition-colors [&_svg]:size-4 [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      {renderIcon()}
    </div>
  )
}

export function WidgetContent({ className, ...props }: WidgetContentProps) {
  return (
    <div
      data-slot="widget-content"
      className={cn("flex flex-col min-w-0 flex-1 justify-center gap-0.5 overflow-hidden", className)}
      {...props}
    />
  )
}

export function WidgetTitle({ className, ...props }: WidgetTitleProps) {
  return (
    <span
      data-slot="widget-title"
      className={cn("text-sm font-medium text-foreground truncate leading-snug", className)}
      {...props}
    />
  )
}

export function WidgetSubtitle({ className, ...props }: WidgetSubtitleProps) {
  return (
    <span
      data-slot="widget-subtitle"
      className={cn("text-xs text-muted-foreground truncate leading-tight", className)}
      {...props}
    />
  )
}

export function WidgetCheckbox({ className, ...props }: WidgetCheckboxProps) {
  const { selected, disabled } = useWidgetItemContext()

  return (
    <div
      data-slot="widget-checkbox"
      className={cn("flex items-center shrink-0", className)}
      {...props}
    >
      <Checkbox
        checked={selected}
        disabled={disabled}
        tabIndex={-1}
        aria-hidden="true"
        className="pointer-events-none"
      />
    </div>
  )
}

export function WidgetExtra({ className, ...props }: WidgetExtraProps) {
  return (
    <div
      data-slot="widget-extra"
      className={cn("flex items-center gap-2 shrink-0 text-sm", className)}
      {...props}
    />
  )
}

// Dot notation attachment for Compound Component pattern
Widget.Root = Widget
Widget.List = WidgetList
Widget.Item = WidgetItem
Widget.Icon = WidgetIcon
Widget.Content = WidgetContent
Widget.Title = WidgetTitle
Widget.Subtitle = WidgetSubtitle
Widget.Checkbox = WidgetCheckbox
Widget.Extra = WidgetExtra
