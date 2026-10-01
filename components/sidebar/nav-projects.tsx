"use client"

import Link from "next/link"
import { ActionsMenu } from "@/components/actions-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { MoreHorizontalIcon } from "lucide-react"
import type { NavOptionItem, SidebarAction, SidebarIcon } from "./types"

interface NavProjectsProps {
  label?: string
  items: NavOptionItem[]
  itemActions?: SidebarAction<NavOptionItem>[]
  onItemAction?: (
    action: SidebarAction<NavOptionItem>,
    item: NavOptionItem
  ) => void
  moreAction?: {
    label: string
    icon?: SidebarIcon
    onClick?: () => void
    href?: string
  }
  hideWhenCollapsed?: boolean
}

export function NavProjects({
  label,
  items,
  itemActions = [],
  onItemAction,
  moreAction,
  hideWhenCollapsed = true,
}: NavProjectsProps) {
  const { isMobile } = useSidebar()
  const MoreIcon = moreAction?.icon ?? MoreHorizontalIcon

  return (
    <SidebarGroup
      className={
        hideWhenCollapsed ? "group-data-[collapsible=icon]:hidden" : undefined
      }
    >
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item) => {
          const ItemIcon = item.icon
          const actions = item.actions ?? itemActions

          return (
            <SidebarMenuItem key={item.id ?? item.title}>
              <SidebarMenuButton render={<Link href={item.url} />}>
                {ItemIcon && <ItemIcon />}
                <span>{item.title}</span>
              </SidebarMenuButton>

              {actions.length > 0 && (
                <ActionsMenu
                  row={item}
                  actions={actions}
                  onAction={(action, row) => onItemAction?.(action, row.original)}
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                  trigger={
                    <SidebarMenuAction
                      showOnHover
                      className="aria-expanded:bg-muted"
                    />
                  }
                >
                  <MoreHorizontalIcon />
                  <span className="sr-only">Opções</span>
                </ActionsMenu>
              )}
            </SidebarMenuItem>
          )
        })}

        {moreAction && (
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={moreAction.onClick}
              render={
                moreAction.href ? <Link href={moreAction.href} /> : undefined
              }
              className="text-sidebar-foreground/70"
            >
              <MoreIcon className="text-sidebar-foreground/70" />
              <span>{moreAction.label}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}