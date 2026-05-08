import { TransactionStatus } from "@/generated/prisma/enums";
import { 
    LucideIcon, 
    Ban, 
    Clock, 
    CheckCircle2, 
    CalendarClock 
} from "lucide-react";

export interface StatusConfig {
    label: string
    color: string
    borderColor: string
    icon: LucideIcon
}

export const STATUS_CONFIG: Record<TransactionStatus, StatusConfig> = {
    CANCELED: {
        label: "Cancelada",
        color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        borderColor: "border-red-300 dark:border-red-800",
        icon: Ban,
    },
    PENDING: {
        label: "Pendente",
        color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        borderColor: "border-yellow-300 dark:border-yellow-800",
        icon: Clock
    }, 
    SETTLED: {
        label: "Concluída",
        color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        borderColor: "border-green-300 dark:border-green-800",
        icon: CheckCircle2
    }, 
    PROJECTED: {
        label: "Projetada",
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        borderColor: "border-blue-300 dark:border-blue-800",
        icon: CalendarClock
    }
}