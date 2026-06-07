import { TransactionType } from "@/generated/prisma/enums";
import { ArrowDownCircle, ArrowLeftRight, ArrowUpCircle, LucideIcon } from "lucide-react";

export type OperationTheme = {
    label: string
    icon: LucideIcon
    color: string
    bg: string
}

export const OPERATION_THEMES: Record<TransactionType, OperationTheme> = {
    EXPENSE: {
        label: "Despesa",
        icon: ArrowDownCircle,
        color: "text-rose-600 dark:text-rose-400",
        bg: "bg-rose-100 dark:bg-rose-500/10"
    }, 
    INCOME: {
        label: "Receita",
        icon: ArrowUpCircle,
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-100 dark:bg-emerald-500/10"
    },
    TRANSFER: {
        label: "Transferência",
        icon: ArrowLeftRight,
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-100 dark:bg-blue-500/10",
    }
}
