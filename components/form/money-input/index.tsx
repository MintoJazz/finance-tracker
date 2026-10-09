"use client"

import type { ChangeEvent } from "react"

import { useMoneyInput } from "@/hooks/use-money-input"
import { formatMoney } from "@/lib/formatters"
import { cn } from "@/lib/utils"

import type { MoneyInputProps } from "./types"

export function MoneyInput({
  value,
  onChange,
  className,
  type = "search",
  inputMode = "numeric",
  autoComplete = "one-time-code",
  autoCorrect = "off",
  spellCheck = false,
  ...props
}: MoneyInputProps) {
  const { obterCentavos } = useMoneyInput()

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    onChange?.(obterCentavos(e.target.value))
  }

  return (
    <input
      type={type}
      inputMode={inputMode}
      autoComplete={autoComplete}
      autoCorrect={autoCorrect}
      spellCheck={spellCheck}
      data-form-type="other"
      data-lpignore="true"
      {...props}
      onChange={handleChange}
      value={formatMoney(value ?? 0)}
      className={cn(
        "outline-none p-0 m-0 focus:ring-0 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden",
        className
      )}
    />
  )
}