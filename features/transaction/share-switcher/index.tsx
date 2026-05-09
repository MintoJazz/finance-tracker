import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Users2 } from "lucide-react";

interface Props {
    isShared: boolean
    onClick: (isShared: boolean) => void
    className: string
}

export default function ShareSwitcher({ isShared, onClick, className }: Props) {
    return <Button variant="ghost" size={"icon-sm"} 
        className={cn("flex items-center justify-center transition-colors p-1", className)} 
        onClick={() => onClick(!isShared)}
    >
        <Users2 size={12} />
    </Button>
}