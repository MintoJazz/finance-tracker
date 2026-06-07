import { Action } from "@/types/changes";

export interface ActionTheme {
    footerBg: string
    border: string
    color: string
}

export const ACTION_THEMES: Record<Action | "stable", ActionTheme> = {
    "add": {
        footerBg: "bg-emerald-50 dark:bg-emerald-500/20",
        border: "border-emerald-200 dark:border-emerald-500/40",
        color: "text-emerald-700 dark:text-emerald-400",
    },
    "edit": {
        footerBg: "bg-amber-50 dark:bg-amber-500/20",
        border: "border-amber-200 dark:border-amber-500/40",
        color: "text-amber-700 dark:text-amber-400",
    },
    "remove": {
        footerBg: "bg-rose-50 dark:bg-rose-500/20",
        border: "border-rose-200 dark:border-rose-500/40",
        color: "text-rose-700 dark:text-rose-400",
    },
    "stable": {
        footerBg: "",
        border: "border-border dark:border-border/50",
        color: "text-muted-foreground",
    }
};
