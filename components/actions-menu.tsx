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

interface RowActionsMenuProps<T, TContext = any> {
    actions?: RowAction<T, TContext>[]
    data: T
    context?: TContext
    align?: "start" | "center" | "end"
    className?: string
}

export function ActionsMenu<T, TContext = any>({ 
    actions, 
    data, 
    context,
    align = "end",
    className 
}: RowActionsMenuProps<T, TContext>) {
    if (!actions || actions.length === 0) return null

    return (
        <DropdownMenu modal={false}>
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
                {actions.map((action, i) => {
                    if (action.hidden && action.hidden({ original: data } as Row<T>, context as TContext)) return null;
                    return (
                        <DropdownMenuItem
                            key={i}
                            onSelect={() => action.onClick({ original: data } as Row<T>, context as TContext)}
                        >
                            {action.label}
                        </DropdownMenuItem>
                    )
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}