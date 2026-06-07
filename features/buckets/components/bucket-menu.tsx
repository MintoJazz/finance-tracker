import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ActionSet } from "@/types/action-set";
import { BucketList } from "@/types/database";
import { MoreHorizontal } from "lucide-react";

interface Props {
    actions: ActionSet<BucketList>[]
    bucket: BucketList
}

export default function BucketMenu({ actions, bucket }: Props) {
    return <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                <MoreHorizontal size={16} className="text-muted-foreground" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            {actions.map((actionProps, index) => <DropdownMenuItem key={index} {...actionProps} onClick={() => actionProps.onAction(bucket)} />)}
        </DropdownMenuContent>
    </DropdownMenu>
}
