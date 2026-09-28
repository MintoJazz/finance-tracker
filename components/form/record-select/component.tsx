"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { RecordSelectItemContent } from "./item"
import { RecordSelectTrigger } from "./trigger"
import type { RecordSelectProps } from "./types"
import { getRecordEntries } from "./utils"

export default function RecordSelect({
  value,
  onChange,
  children,
  options,
  keys,
  renderItem,
  placeholder = "Selecione...",
  className,
}: RecordSelectProps) {
  const entries = getRecordEntries(options, keys)
  const displayLabel = options[value]?.label ?? placeholder

  return (
    <DropdownMenu>
      {children ? (
        <DropdownMenuTrigger>
          {typeof children === "function" ? children(value) : children}
        </DropdownMenuTrigger>
      ) : (
        <RecordSelectTrigger label={displayLabel} className={className} />
      )}

      <DropdownMenuContent align="start" className="min-w-50">
        <DropdownMenuGroup>
          {entries.map(([key, config]) => {
            const isSelected = value === key

            return (
              // Base UI usa onClick (onSelect é do Radix)
              <DropdownMenuItem key={key} onClick={() => onChange(key)}>
                {renderItem ? (
                  renderItem(key, isSelected)
                ) : (
                  <RecordSelectItemContent
                    label={config.label}
                    isSelected={isSelected}
                    checkOnLeft={!!keys}
                  />
                )}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}