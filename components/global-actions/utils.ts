import type { RowAction } from "@/types/actions.types"
import type { GlobalAction } from "./types"

/** Linha fictícia: ações globais não têm linha, mas os menus de row actions exigem uma. */
export const GLOBAL_ACTIONS_ROW = { original: null }

export function toRowActions(
  actions: GlobalAction[]
): RowAction<null, undefined>[] {
  return actions.map((action) => ({
    id: action.id,
    label: action.label,
    icon: action.icon,
    href: action.href,
    variant: action.variant,
    disabled: action.disabled,
    confirmTitle: action.confirmTitle,
    confirmDescription: action.confirmDescription,
    onClick: action.onClick ? () => action.onClick?.() : undefined,
  }))
}
