import type { ReactNode } from "react"

export type RecordOptions = Record<string, { label: string }>

export interface RecordSelectProps {
  value?: string
  onChange?: (value: string) => void
  options: RecordOptions
  children?: ReactNode | ((currentValue: string) => ReactNode)
  placeholder?: string
  keys?: string[]
  renderItem?: (key: string, isSelected: boolean) => ReactNode
  className?: string
}