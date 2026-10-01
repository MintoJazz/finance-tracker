import * as React from "react"

export type ListItem = { id: number; name: string }

export interface ListSelectProps {
  id?: string
  "aria-invalid"?: boolean | "true" | "false" | "grammar" | "spelling"
  value?: number | null
  onChange?: (value: number | null) => void
  onBlur?: () => void
  name?: string
  options: ListItem[]
  placeholder?: string
  className?: string
  ref?: React.Ref<HTMLInputElement>
}