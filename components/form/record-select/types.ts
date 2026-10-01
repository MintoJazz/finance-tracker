import type { ReactNode } from "react"

export type RecordOptions = Record<string, { label: string }>

export interface RecordSelectProps {
  id?: string
  "aria-invalid"?: boolean | "true" | "false" | "grammar" | "spelling"
  name?: string
  onBlur?: () => void
  ref?: React.Ref<HTMLButtonElement>
  value?: string
  onChange?: (value: string) => void
  options: RecordOptions
  children?: ReactNode | ((currentValue: string) => ReactNode)
  placeholder?: string
  keys?: string[]
  renderItem?: (key: string, isSelected: boolean) => ReactNode
  className?: string
}