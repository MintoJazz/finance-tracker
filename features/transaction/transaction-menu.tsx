import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Transaction } from "@/generated/prisma/browser";
import { MoreHorizontal } from "lucide-react";
import { ComponentProps } from "react";

export interface ActionSet extends ComponentProps<typeof DropdownMenuItem>{
    onAction: (transaction: Transaction) => void
}

interface Props {
    actions: ActionSet[]
    transaction: Transaction
}

export default function TransactionMenu({ actions, transaction }: Props) {
    return <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                <MoreHorizontal size={16} className="text-muted-foreground" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            {actions.map((actionProps, index) => (
                <DropdownMenuItem key={index} {...actionProps} onClick={() => actionProps.onAction(transaction)} />
            ))}
        </DropdownMenuContent>
    </DropdownMenu>
}