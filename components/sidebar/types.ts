import type { ActionIcon, RowAction } from "@/types/actions.types"

export type SidebarIcon = ActionIcon

export type SidebarAction<TData = unknown, TContext = unknown> = RowAction<
  TData,
  TContext
>

export interface SwitcherOption {
  id: string
  title: string
  subtitle?: string
  logo?: SidebarIcon
  shortcut?: string
}

export interface NavCollapsibleSubItem {
  title: string
  url: string
  isActive?: boolean
}

export interface NavCollapsibleItem {
  title: string
  url?: string
  icon?: SidebarIcon
  isActive?: boolean
  items?: NavCollapsibleSubItem[]
  actions?: SidebarAction<NavCollapsibleItem>[]
}

export interface NavOptionItem {
  id?: string
  title: string
  url: string
  icon?: SidebarIcon
  actions?: SidebarAction<NavOptionItem>[]
}

export interface SidebarUserProfile {
  name: string
  subtitle: string
  avatar?: string
  fallback?: string
}