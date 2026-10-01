"use client"

import { ActionsMenu } from "@/components/actions-menu"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { ChevronsUpDownIcon } from "lucide-react"
import type { SidebarAction, SidebarUserProfile } from "./types"

interface UserMenuProps {
  profile: SidebarUserProfile
  actionGroups?: SidebarAction<SidebarUserProfile>[][]
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

export function UserMenu({ profile, actionGroups = [] }: UserMenuProps) {
  const { isMobile } = useSidebar()
  const fallbackText = profile.fallback ?? (getInitials(profile.name) || "U")

  const userSummary = (
    <>
      <Avatar>
        <AvatarImage src={profile.avatar} alt={profile.name} />
        <AvatarFallback>{fallbackText}</AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{profile.name}</span>
        <span className="truncate text-xs">{profile.subtitle}</span>
      </div>
    </>
  )

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <ActionsMenu
          row={profile}
          actionGroups={actionGroups}
          side={isMobile ? "bottom" : "right"}
          align="end"
          sideOffset={4}
          trigger={
            <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
          }
          header={
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              {userSummary}
            </div>
          }
        >
          {userSummary}
          <ChevronsUpDownIcon className="ml-auto size-4" />
        </ActionsMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}