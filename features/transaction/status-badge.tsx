import { Button } from "@/components/ui/button";
import { StatusConfig } from "@/constants/status";
import { cn } from "@/lib/utils";

interface Props {
    statusConfig: StatusConfig
}

export default function StatusBadge({ statusConfig }: Props) {
    const Icon = statusConfig.icon

    return <Button variant="outline" className={cn(
        "h-fit px-1.5 py-0.5 gap-1 rounded-md text-[9px] uppercase font-black tracking-tight",
        statusConfig.color,
        statusConfig.borderColor
    )} >
        <Icon size={10} />
        {statusConfig.label}
    </Button>
}