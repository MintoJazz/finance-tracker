"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { NavMain } from "@/components/sidebar/nav-main"
import { UserMenu } from "@/components/sidebar/user-menu"
import { ContextSwitcher } from "@/components/sidebar/context-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { getRoleLabel } from "@/modules/space/ui/themes"
import { switchContextAction } from "@/modules/space/ui/actions/switch-context.action"
import type { UserContextData } from "@/modules/auth/models/user-context.schema"
import { sidebarConfig } from "./config"
import type { SwitcherOption, SidebarUserProfile } from "./types"
import { NavSecondary } from "./nav-secondary"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userContext?: UserContextData | null
}

export function AppSidebar({ userContext, ...props }: AppSidebarProps) {
  const router = useRouter()
  const [, startTransition] = React.useTransition()
  const { navMain, navSecondary, switcher, user } = sidebarConfig

  const contexts = userContext?.contexts
  const profile = userContext?.profile

  const switcherOptions = React.useMemo<SwitcherOption[]>(() => {
    if (!contexts || contexts.length === 0) {
      return switcher.options
    }

    return contexts.map((ctx) => ({
      id: String(ctx.id),
      title: ctx.name,
      subtitle: getRoleLabel(ctx.role),
    }))
  }, [contexts, switcher.options])

  const userProfile = React.useMemo<SidebarUserProfile>(() => {
    if (!profile) {
      return user.profile
    }

    return {
      name: profile.name,
      subtitle: profile.email,
      avatar: profile.avatarUrl ?? undefined,
      fallback: profile.initials,
    }
  }, [profile, user.profile])

  const handleContextChange = React.useCallback(
    (option: SwitcherOption) => {
      const targetId = Number(option.id)
      if (Number.isNaN(targetId) || targetId === userContext?.activeContextId) return

      startTransition(async () => {
        const result = await switchContextAction(targetId)
        if (result.success) {
          router.refresh()
        }
      })
    },
    [userContext?.activeContextId, router]
  )

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <ContextSwitcher
          {...switcher}
          options={switcherOptions}
          value={userContext ? String(userContext.activeContextId) : undefined}
          onValueChange={handleContextChange}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain {...navMain} />
        {/* <NavProjects {...projects} /> */}
        <NavSecondary {...navSecondary} className="mt-auto"/>
      </SidebarContent>
      <SidebarFooter>
        <UserMenu profile={userProfile} actionGroups={user.actionGroups} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}