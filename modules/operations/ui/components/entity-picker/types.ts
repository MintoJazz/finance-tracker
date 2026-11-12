import type { ReactNode } from "react"

export interface EntityPickerItem<TId extends string | number = number> {
  id: TId
  title: ReactNode
  /** Texto simples para busca quando title for um nó ReactNode */
  titleText?: string
  subtitle?: string
  /** Conteúdo complementar opcional alinhado à direita (antes do checkbox) */
  extra?: ReactNode
  /** Nome de ícone do Lucide (ex.: "Wallet", "CreditCard", "ShoppingCart") */
  icon?: string | null
  /** Cor hexadecimal opcional para destacar o ícone */
  color?: string | null
  /** Palavras-chave extras para filtro de busca */
  keywords?: string[]
  /** Indica se o item está desabilitado para seleção */
  disabled?: boolean
}

export interface EntityPickerSingleProps<TId extends string | number = number> {
  multiple?: false
  items: readonly EntityPickerItem<TId>[]
  value?: TId | null
  onChange: (value: TId | null, item?: EntityPickerItem<TId>) => void
  variant?: "carousel" | "grid"
  indicator?: "checkbox" | "radio" | "chevron" | "none"
  searchable?: boolean
  searchPlaceholder?: string
  allowDeselect?: boolean
  emptyMessage?: string
  loading?: boolean
  listClassName?: string
  className?: string
}

export interface EntityPickerMultipleProps<
  TId extends string | number = string,
> {
  multiple: true
  items: readonly EntityPickerItem<TId>[]
  value?: readonly TId[]
  onChange: (value: TId[], items: EntityPickerItem<TId>[]) => void
  variant?: "carousel" | "grid"
  indicator?: "checkbox" | "radio" | "chevron" | "none"
  searchable?: boolean
  searchPlaceholder?: string
  emptyMessage?: string
  loading?: boolean
  listClassName?: string
  className?: string
}

export type EntityPickerProps<TId extends string | number = any> =
  | EntityPickerSingleProps<TId>
  | EntityPickerMultipleProps<TId>
