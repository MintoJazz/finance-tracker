import type { ReactNode } from "react"

import { FieldGroup } from "@/components/ui/field"

export function FormContent({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <FieldGroup className={className ?? "gap-2"}>{children}</FieldGroup>
}