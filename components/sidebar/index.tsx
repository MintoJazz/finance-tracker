"use client"

import * as React from "react"
import { NavMain } from "@/components/sidebar/nav-main"
import { NavProjects } from "@/components/sidebar/nav-projects"
import { UserMenu } from "@/components/sidebar/user-menu"
import { ContextSwitcher } from "@/components/sidebar/context-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { sidebarConfig } from "./config"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { navMain, projects, switcher, user } = sidebarConfig
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <ContextSwitcher {...switcher} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain {...navMain} />
        <NavProjects {...projects} />
      </SidebarContent>
      <SidebarFooter>
        <UserMenu {...user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}