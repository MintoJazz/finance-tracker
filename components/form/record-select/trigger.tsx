"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface RecordSelectTriggerProps {
  id?: string
  "aria-invalid"?: boolean | "true" | "false" | "grammar" | "spelling"
  name?: string
  onBlur?: () => void
  ref?: React.Ref<HTMLButtonElement>
  label: string
  className?: string
}

/** Gatilho padrão (botão outline com chevron) */
export function RecordSelectTrigger({
  id,
  "aria-invalid": ariaInvalid,
  name,
  onBlur,
  ref,
  label,
  className,
}: RecordSelectTriggerProps) {
  return (
    <DropdownMenuTrigger
      render={
        <Button
          id={id}
          aria-invalid={ariaInvalid}
          name={name}
          onBlur={onBlur}
          ref={ref}
          variant="outline"
          role="combobox"
          className={cn("w-full justify-between font-normal", className)}
        />
      }
    >
      {label}
      <ChevronDown className="ml-2 h-4 w-4 opacity-50 shrink-0" />
    </DropdownMenuTrigger>
  )
}