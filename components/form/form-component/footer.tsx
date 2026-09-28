import type { ReactNode } from "react"

export function FormFooter({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={className ?? "flex items-center justify-end gap-1"}>
      {children}
    </div>
  )
}