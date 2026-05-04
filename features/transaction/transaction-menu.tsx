import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

export default function TransactionMenu() {
    return <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
        <MoreHorizontal size={16} className="text-muted-foreground" />
    </Button>
}