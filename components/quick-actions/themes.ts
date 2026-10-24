import type { ActionColor } from "@/types/actions.types"

export interface QuickActionTheme {
  containerClassName: string
  iconClassName: string
}

export const QUICK_ACTION_THEMES: Record<ActionColor, QuickActionTheme> = {
  neutral: {
    containerClassName:
      "border-border/70 bg-muted/60 dark:bg-muted/40 group-hover:bg-muted",
    iconClassName: "text-muted-foreground group-hover:text-foreground",
  },
  rose: {
    containerClassName:
      "border-rose-500/20 bg-rose-500/10 dark:bg-rose-500/15 dark:border-rose-500/30 group-hover:bg-rose-500/20",
    iconClassName: "text-rose-600 dark:text-rose-400",
  },
  emerald: {
    containerClassName:
      "border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-500/15 dark:border-emerald-500/30 group-hover:bg-emerald-500/20",
    iconClassName: "text-emerald-600 dark:text-emerald-400",
  },
  blue: {
    containerClassName:
      "border-blue-500/20 bg-blue-500/10 dark:bg-blue-500/15 dark:border-blue-500/30 group-hover:bg-blue-500/20",
    iconClassName: "text-blue-600 dark:text-blue-400",
  },
  amber: {
    containerClassName:
      "border-amber-500/20 bg-amber-500/10 dark:bg-amber-500/15 dark:border-amber-500/30 group-hover:bg-amber-500/20",
    iconClassName: "text-amber-600 dark:text-amber-400",
  },
  indigo: {
    containerClassName:
      "border-indigo-500/20 bg-indigo-500/10 dark:bg-indigo-500/15 dark:border-indigo-500/30 group-hover:bg-indigo-500/20",
    iconClassName: "text-indigo-600 dark:text-indigo-400",
  },
  purple: {
    containerClassName:
      "border-purple-500/20 bg-purple-500/10 dark:bg-purple-500/15 dark:border-purple-500/30 group-hover:bg-purple-500/20",
    iconClassName: "text-purple-600 dark:text-purple-400",
  },
  sky: {
    containerClassName:
      "border-sky-500/20 bg-sky-500/10 dark:bg-sky-500/15 dark:border-sky-500/30 group-hover:bg-sky-500/20",
    iconClassName: "text-sky-600 dark:text-sky-400",
  },
}

export function getQuickActionTheme(color?: ActionColor): QuickActionTheme {
  return QUICK_ACTION_THEMES[color ?? "neutral"]
}
