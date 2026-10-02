"use client"

import * as React from "react"
import { ActionsMenu } from "@/components/actions-menu"
import BalanceAvatar from "@/components/balance-avatar"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { ChevronsUpDownIcon } from "lucide-react"
import { onLogout } from "@/modules/identity/ui/actions/logout.action"
import type { SidebarAction, SidebarUserProfile } from "./types"

interface UserMenuProps {
  profile: SidebarUserProfile
  actionGroups?: SidebarAction<SidebarUserProfile>[][]
}

export function UserMenu({ profile, actionGroups = [] }: UserMenuProps) {
  const { isMobile } = useSidebar()
  const [isPending, startTransition] = React.useTransition()

  const handleAction = React.useCallback(
    (action: SidebarAction<SidebarUserProfile>) => {
      if (action.id === "logout") {
        startTransition(async () => {
          await onLogout()
        })
      }
    },
    []
  )

  const userSummary = (
    <>
      <BalanceAvatar
        name={profile.name}
        avatarUrl={profile.avatar}
        size="md"
        shape="circle"
      />
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
          onAction={handleAction}
          side={isMobile ? "bottom" : "right"}
          align="end"
          sideOffset={4}
          trigger={
            <SidebarMenuButton
              size="lg"
              className="aria-expanded:bg-muted"
              disabled={isPending}
            />
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