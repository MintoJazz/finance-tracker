import * as React from "react"

export type ListItem = { id: number; name: string }

export interface ListSelectProps {
  value?: number | null
  onChange?: (value: number | null) => void
  onBlur?: () => void
  name?: string
  options: ListItem[]
  placeholder?: string
  ref?: React.Ref<HTMLInputElement>
}