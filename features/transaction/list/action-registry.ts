import { Action } from "@/transactions/types/display";

export interface ActionConfig {
    footerBg: string
    border: string
    color: string
}

export const ACTIONS_CONFIG: Record<Action | "stable", ActionConfig> = {
    "add": {
        footerBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
        border: "border-emerald-500/40",
        color: "text-emerald-600",
    },
    "edit": {
        footerBg: "bg-amber-500/10 dark:bg-amber-500/20",
        border: "border-amber-500/40",
        color: "text-amber-600",
    },
    "remove": {
        footerBg: "bg-rose-500/10 dark:bg-rose-500/20",
        border: "border-rose-500/40",
        color: "text-rose-600",
    },
    "stable": {
        footerBg: "bg-muted/10",
        border: "border-border/50",
        color: "text-muted-foreground",
    }
};