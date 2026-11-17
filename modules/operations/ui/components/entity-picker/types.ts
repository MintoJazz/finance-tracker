import type { ReactNode } from "react"

export interface EntityPickerNavigatorProps {
  title: ReactNode
  badge?: {
    label: string
    tone?: "destructive" | "amber" | "emerald" | "neutral"
  }
  canPrev?: boolean
  canNext?: boolean
  onPrev: () => void
  onNext: () => void
  isLoading?: boolean
  prevLabel?: string
  nextLabel?: string
}

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
  navigator?: EntityPickerNavigatorProps
  allowDeselect?: boolean
  emptyMessage?: string
  loading?: boolean
  listClassName?: string
  className?: string
  hideIcon?: boolean
  /**
   * Habilita a opção "Criar 'texto'" quando a busca não corresponde exatamente
   * a nenhum item. Recebe o texto digitado (já sem espaços nas pontas).
   */
  onCreate?: (query: string) => void
  /** Rótulo customizado da opção de criação (padrão: `Criar "texto"`) */
  createLabel?: (query: string) => ReactNode
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
  navigator?: EntityPickerNavigatorProps
  emptyMessage?: string
  loading?: boolean
  listClassName?: string
  className?: string
  hideIcon?: boolean
}

export type EntityPickerProps<TId extends string | number = any> =
  | EntityPickerSingleProps<TId>
  | EntityPickerMultipleProps<TId>
