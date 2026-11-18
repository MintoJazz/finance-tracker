import type { ReactNode } from "react"
import type { ActionIcon } from "@/types/actions.types"

/**
 * Ação global (sem linha associada). Mesmo vocabulário de `RowAction`,
 * mas sem `row` nos callbacks.
 */
export interface GlobalAction {
  id: string
  label: string | ReactNode
  icon?: ActionIcon | ReactNode
  href?: string
  onClick?: () => void | Promise<void>
  hidden?: boolean
  disabled?: boolean
  variant?: "default" | "destructive"
  /** No drawer mobile, aparece como bloco vertical em destaque em vez de item de lista. */
  featured?: boolean
  /** Tom de destaque para ações featured (cor do ícone e da borda). */
  tone?: "positive" | "negative"
  confirmTitle?: string
  confirmDescription?: string
}
