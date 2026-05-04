import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { STATUS_CONFIG, StatusConfig } from "@/constants/status";
import { TransactionStatus } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Props {current: TransactionStatus
    onClick: (status: TransactionStatus) => void
    statusConfig: StatusConfig
}

export default function StatusBadge({ statusConfig, current, onClick }: Props) {
    const options = STATUS_CONFIG
    const Icon = statusConfig.icon

    return <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="outline" className={cn(
                "h-fit px-1.5 py-0.5 gap-1 rounded-md text-[9px] uppercase font-black tracking-tight",
                statusConfig.color,
                statusConfig.borderColor
            )} >
                <Icon size={10} />
                {statusConfig.label}
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            <DropdownMenuGroup>
                {
                    Object.entries(options).map(([key, val]) => <DropdownMenuItem className="flex gap-2 justify-between"
                        key={key}
                        onSelect={() => onClick(key as TransactionStatus)}>
                        {val.label}
                        <Check className={cn(
                            "mr-2 h-4 w-4",
                            options[current as TransactionStatus].label === options[key as TransactionStatus].label ? "opacity-100" : "opacity-0"
                        )} />
                    </DropdownMenuItem>)
                }
            </DropdownMenuGroup>
        </DropdownMenuContent>
    </DropdownMenu>
}