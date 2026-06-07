import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TransactionStatus } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { STATUS_THEMES } from "../themes/status-themes";
import { Badge } from "@/components/ui/badge";

interface Props {
    current: TransactionStatus;
    onClick: (status: TransactionStatus) => void;
}

export default function StatusBadge({ current, onClick }: Props) {
    const options = STATUS_THEMES;
    const theme = STATUS_THEMES[current];
    const Icon = theme.icon;
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {/*
                
                    <Button
                    variant="outline"
                    className={cn(
                        "h-fit gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                        theme.color,
                        theme.borderColor
                    )}
                >
                    <Icon size={11} className="-ml-0.5" />
                    {theme.label}
                </Button>

                */}

                <Badge className={cn(theme.color, theme.borderColor, "cursor-pointer")} >
                    <Icon size={11} className="-ml-0.5" />
                    {theme.label}
                </Badge>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                <DropdownMenuGroup>
                    {Object.entries(options).map(([key, val]) => (
                        <DropdownMenuItem
                            className="flex justify-between gap-2"
                            key={key}
                            onSelect={() => onClick(key as TransactionStatus)}
                        >
                            {val.label}
                            <Check
                                className={cn(
                                    "mr-2 h-4 w-4",
                                    current === (key as TransactionStatus)
                                        ? "opacity-100"
                                        : "opacity-0"
                                )}
                            />
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}