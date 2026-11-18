"use client"

import { useMemo } from "react"
import { usePathname } from "next/navigation"
import { useHeaderContext } from "./context"
import { buildTrail } from "./utils"

/** Título da tela atual (último item do breadcrumb), o mesmo exibido no header. */
export function useCurrentTitle(): string | null {
  const pathname = usePathname()
  const { labels } = useHeaderContext()
  return useMemo(() => {
    const label = buildTrail(pathname, labels).at(-1)?.label
    return typeof label === "string" && label ? label : null
  }, [pathname, labels])
}
