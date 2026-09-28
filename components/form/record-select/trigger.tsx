"use client"

import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface RecordSelectTriggerProps {
  label: string
  className?: string
}

/** Gatilho padrão (botão outline com chevron) */
export function RecordSelectTrigger({ label, className }: RecordSelectTriggerProps) {
  return (
    <DropdownMenuTrigger
      render={
        <Button
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