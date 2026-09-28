import type * as React from "react"

export interface DatePickerProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value?: Date | string
  onChange?: (date: Date | undefined) => void
}