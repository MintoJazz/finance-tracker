import type { ComponentProps } from "react"

export type MoneyInputProps = Omit<ComponentProps<"input">, "onChange" | "value"> & {
  value?: number
  onChange?: (value: number) => void
}