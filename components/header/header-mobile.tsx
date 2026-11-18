import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Crumb } from "./types"
import { Skeleton } from "@/components/ui/skeleton"
import { SidebarTrigger } from "../ui/sidebar"

export function HeaderMobile({ trail, className }: { trail: Crumb[]; className?: string }) {
  if (trail.length === 0) return null
  
  const currentCrumb = trail.at(-1)!
  const parentCrumb = trail.at(-2) ?? null

  return (
    <div className={`flex w-full min-w-0 items-center justify-between gap-3 ${className ?? ""}`}>
      {parentCrumb ? (
        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          render={<Link href={parentCrumb.href} />}
          nativeButton={false}
          aria-label={`Voltar para ${parentCrumb.label || "página anterior"}`}
        >
          <ArrowLeft className="size-4" />
        </Button>
      ) : (
        <div className="size-8 shrink-0" />
      )}

      {/* Título centralizado em relação ao header inteiro, independente do botão de voltar */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 flex max-w-[calc(100%-11rem)] -translate-x-1/2 -translate-y-1/2 justify-center text-center">
        {currentCrumb.label ? (
          <span className="text-base font-semibold tracking-tight text-foreground truncate">
            {currentCrumb.label}
          </span>
        ) : (
          <Skeleton className="h-5 w-32" />
        )}
      </div>

      <SidebarTrigger className="2-ml-1" />
    </div>
  )
}
