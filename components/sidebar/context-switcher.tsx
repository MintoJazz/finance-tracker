"use client"

import * as React from "react"
import { ActionsMenu, renderActionIcon } from "@/components/actions-menu"
import BalanceAvatar from "@/components/balance-avatar"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { ChevronsUpDownIcon } from "lucide-react"
import type { SidebarAction, SwitcherOption } from "./types"

interface ContextSwitcherProps {
  options: SwitcherOption[]
  label?: string
  value?: string
  defaultValue?: string
  onValueChange?: (option: SwitcherOption) => void
  footerAction?: SidebarAction
}

export function ContextSwitcher({
  options,
  label = "Opções",
  value,
  defaultValue,
  onValueChange,
  footerAction,
}: ContextSwitcherProps) {
  const { isMobile } = useSidebar()
  const [internalId, setInternalId] = React.useState<string | undefined>(
    defaultValue ?? options[0]?.id
  )

  const activeId = value ?? internalId
  const activeOption =
    options.find((opt) => opt.id === activeId) ?? options[0]

  const handleSelect = React.useCallback(
    (option: SwitcherOption) => {
      if (value === undefined) {
        setInternalId(option.id)
      }
      onValueChange?.(option)
    },
    [value, onValueChange]
  )

  const actionGroups = React.useMemo<SidebarAction[][]>(() => {
    const optionActions: SidebarAction[] = options.map((option, index) => {
      const OptionLogo = option.logo
      return {
        id: option.id,
        label: option.subtitle ? (
          <div className="flex flex-col text-left">
            <span className="font-medium leading-tight">{option.title}</span>
            <span className="text-xs text-muted-foreground leading-tight">
              {option.subtitle}
            </span>
          </div>
        ) : (
          option.title
        ),
        shortcut: option.shortcut ?? `⌘${index + 1}`,
        icon: OptionLogo ? (
          <div className="flex size-6 items-center justify-center rounded-md border">
            <OptionLogo />
          </div>
        ) : (
          <BalanceAvatar name={option.title} size="xs" />
        ),
        onClick: () => handleSelect(option),
      }
    })

    if (!footerAction) return [optionActions]

    const footerGroup: SidebarAction[] = [
      {
        ...footerAction,
        label: (
          <span className="font-medium text-muted-foreground">
            {footerAction.label}
          </span>
        ),
        icon: footerAction.icon ? (
          <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
            {renderActionIcon(footerAction.icon, "size-4")}
          </div>
        ) : undefined,
      },
    ]

    return [optionActions, footerGroup]
  }, [options, footerAction, handleSelect])

  if (!activeOption) {
    return null
  }

  const ActiveLogo = activeOption.logo

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <ActionsMenu
          row={activeOption}
          label={label}
          actionGroups={actionGroups}
          align="start"
          side={isMobile ? "bottom" : "right"}
          sideOffset={4}
          trigger={
            <SidebarMenuButton
              size="lg"
              className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
            />
          }
        >
          {ActiveLogo ? (
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <ActiveLogo />
            </div>
          ) : (
            <BalanceAvatar name={activeOption.title} size="md" />
          )}
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{activeOption.title}</span>
            {activeOption.subtitle && (
              <span className="truncate text-xs text-muted-foreground">{activeOption.subtitle}</span>
            )}
          </div>
          <ChevronsUpDownIcon className="ml-auto" />
        </ActionsMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}