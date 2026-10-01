"use client"

import type { ChangeEvent } from "react"

import { useMoneyInput } from "@/hooks/use-money-input"
import { formatMoney } from "@/lib/formatters"
import { cn } from "@/lib/utils"

import type { MoneyInputProps } from "./types"

export function MoneyInput({ value, onChange, className, ...props }: MoneyInputProps) {
  const { obterCentavos } = useMoneyInput()

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    onChange?.(obterCentavos(e.target.value))
  }

  return (
    <input
      {...props}
      type="text"
      onChange={handleChange}
      value={formatMoney(value ?? 0)}
      className={cn("outline-none p-0 m-0 focus:ring-0", className)}
    />
  )
}