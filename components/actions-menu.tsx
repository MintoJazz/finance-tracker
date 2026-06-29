"use client"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { RowAction } from "@/components/ui/data-table"
import { Row } from "@tanstack/react-table"
import { cn } from "@/lib/utils"

interface RowActionsMenuProps<T> {
    actions?: RowAction<T>[]
    data: T
    align?: "start" | "center" | "end"
    className?: string
}

export function ActionsMenu<T>({ 
    actions, 
    data, 
    align = "end",
    className 
}: RowActionsMenuProps<T>) {
    if (!actions || actions.length === 0) return null

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    className={cn("shrink-0 text-muted-foreground", className)}
                    onClick={(e) => e.stopPropagation()}
                >
                    <MoreHorizontal size={16} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={align} onClick={(e) => e.stopPropagation()}>
                {actions.map((action, i) => (
                    <DropdownMenuItem
                        key={i}
                        onSelect={() => action.onClick({ original: data } as Row<T>)}
                    >
                        {action.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}