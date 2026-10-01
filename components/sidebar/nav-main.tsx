"use client"

import Link from "next/link"
import { ActionsMenu } from "@/components/actions-menu"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { ChevronRightIcon, MoreHorizontalIcon } from "lucide-react"
import type { NavCollapsibleItem, SidebarAction } from "./types"

interface NavMainProps {
  label?: string
  items: NavCollapsibleItem[]
  onItemAction?: (
    action: SidebarAction<NavCollapsibleItem>,
    item: NavCollapsibleItem
  ) => void
}

export function NavMain({ label, items, onItemAction }: NavMainProps) {
  const { isMobile } = useSidebar()

  return (
    <SidebarGroup>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item) => {
          const Icon = item.icon
          const hasSubItems = Boolean(item.items && item.items.length > 0)
          const hasActions = Boolean(item.actions && item.actions.length > 0)

          if (!hasSubItems) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={item.isActive}
                  render={<Link href={item.url ?? "#"} />}
                >
                  {Icon && <Icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
                {hasActions && item.actions && (
                  <ActionsMenu
                    row={item}
                    actions={item.actions}
                    onAction={(action, row) =>
                      onItemAction?.(action, row.original)
                    }
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
          }

          return (
            <Collapsible
              key={item.title}
              defaultOpen={item.isActive}
              className="group/collapsible"
              render={<SidebarMenuItem />}
            >
              <CollapsibleTrigger
                render={<SidebarMenuButton tooltip={item.title} />}
              >
                {Icon && <Icon />}
                <span>{item.title}</span>
                <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton
                        isActive={subItem.isActive}
                        render={<Link href={subItem.url} />}
                      >
                        <span>{subItem.title}</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}