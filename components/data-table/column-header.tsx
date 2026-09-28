"use client"

import type { Column } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>
  title: string
  className?: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={className}>{title}</div>
  }

  const sorted = column.getIsSorted()

  return (
    <DropdownMenu>
      {/* Base UI: usa `render`. Se voltar para Radix, troque por `asChild` */}
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
          />
        }
      >
        <span>{title}</span>
        {sorted === "desc" ? (
          <ArrowDown className="ml-2 h-4 w-4" />
        ) : sorted === "asc" ? (
          <ArrowUp className="ml-2 h-4 w-4" />
        ) : (
          <ArrowUpDown className="ml-2 h-4 w-4" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
          <ArrowUp className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          Asc
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
          <ArrowDown className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          Desc
        </DropdownMenuItem>
        {column.getCanHide() && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
              Ocultar
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}