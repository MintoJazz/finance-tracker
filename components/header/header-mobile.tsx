import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Crumb } from "./types"
import { Skeleton } from "@/components/ui/skeleton"

export function HeaderMobile({ trail, className }: { trail: Crumb[]; className?: string }) {
  if (trail.length === 0) return null
  
  const currentCrumb = trail.at(-1)!
  const parentCrumb = trail.at(-2) ?? null

  return (
    <div className={`flex w-full min-w-0 items-center justify-between gap-3 ${className}`}>
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
      
      <div className="flex-1 text-center min-w-0 flex justify-center">
        {currentCrumb.label ? (
          <span className="text-base font-semibold tracking-tight text-foreground truncate">
            {currentCrumb.label}
          </span>
        ) : (
          <Skeleton className="h-5 w-32" />
        )}
      </div>
      
      <div className="size-8 shrink-0" />
    </div>
  )
}
