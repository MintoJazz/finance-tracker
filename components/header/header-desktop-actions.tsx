"use client"

import Link from "next/link"
import { ArrowDownLeft, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { operationHref } from "@/modules/operations/ui/href"

export function HeaderDesktopActions() {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-xs text-foreground hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/40"
        render={<Link href={operationHref({ nature: "RECEIVE" })} />}
        nativeButton={false}
      >
        <ArrowDownLeft className="size-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>Receber</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-xs text-foreground hover:text-destructive hover:border-destructive/40"
        render={<Link href={operationHref({ nature: "PAY" })} />}
        nativeButton={false}
      >
        <ArrowUpRight className="size-3.5 text-destructive" />
        <span>Pagar</span>
      </Button>
    </div>
  )
}

