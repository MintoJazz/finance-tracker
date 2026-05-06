import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ActionSet } from "@/types/action-set";
import { TransactionDetails } from "@/types/database";
import { MoreHorizontal } from "lucide-react";
import { ComponentProps } from "react";

interface Props {
    actions: ActionSet<TransactionDetails>[]
    transaction: TransactionDetails
}

export default function TransactionMenu({ actions, transaction }: Props) {
    return <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                <MoreHorizontal size={16} className="text-muted-foreground" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            {actions.map((actionProps, index) => <DropdownMenuItem key={index} {...actionProps} onClick={() => actionProps.onAction(transaction)} />)}
        </DropdownMenuContent>
    </DropdownMenu>
}