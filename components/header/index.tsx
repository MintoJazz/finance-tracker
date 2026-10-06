"use client"

import { useMemo } from "react"
import { usePathname } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { buildTrail } from "./utils"
import { useHeaderContext } from "./context"
import { HeaderBreadcrumb } from "./header-breadcrumb"
import { HeaderMobile } from "./header-mobile"


export function AppHeader() {
  const pathname = usePathname()
  const { labels } = useHeaderContext()
  const trail = useMemo(() => buildTrail(pathname, labels), [pathname, labels])

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b border-border/40 md:border-none">
      <div className="flex min-w-0 w-full items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        {trail.length > 0 && (
          <>
            <Separator orientation="vertical" className="hidden md:block mr-2 data-[orientation=vertical]:h-4" />
            <HeaderBreadcrumb trail={trail} className="hidden md:flex min-w-0 flex-1" />
            <HeaderMobile trail={trail} className="flex md:hidden min-w-0 flex-1" />
          </>
        )}
      </div>
    </header>
  )
}

export { HeaderProvider, useBreadcrumbLabel } from "./context"
export { routes, type RouteKey } from "./config"
export { buildHref, routeHref } from "./utils"
