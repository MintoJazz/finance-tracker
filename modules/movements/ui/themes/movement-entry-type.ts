import type { LucideIcon } from "lucide-react";
import {
    ArrowDownLeft,
    ArrowUpRight,
    ArrowLeftRight,
    CheckCircle2,
    FileText,
    RotateCcw,
    SlidersHorizontal,
    ShoppingBag,
} from "lucide-react";
import {
    MovementEntryScope,
    MovementEntryType,
} from "@/modules/movements/models/movement-entry.schema";

export interface MovementEntryTypeTheme {
    resolveLabel: (scope: MovementEntryScope) => string;
    icon: LucideIcon;
    badgeClassName: string;
}

export const MOVEMENT_ENTRY_TYPE_THEMES: Record<
    MovementEntryType,
    MovementEntryTypeTheme
> = {
    INCOME: {
        resolveLabel: () => "Receita",
        icon: ArrowDownLeft,
        badgeClassName:
            "border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10",
    },
    EXPENSE: {
        resolveLabel: () => "Despesa",
        icon: ArrowUpRight,
        badgeClassName:
            "border-rose-500/30 text-rose-700 dark:text-rose-400 bg-rose-500/10",
    },
    PURCHASE: {
        resolveLabel: () => "Compra",
        icon: ShoppingBag,
        badgeClassName: "border-border text-foreground bg-muted/40",
    },
    PROVISION: {
        resolveLabel: () => "Provisão",
        icon: FileText,
        badgeClassName:
            "border-sky-500/30 text-sky-700 dark:text-sky-400 bg-sky-500/10",
    },
    SETTLEMENT: {
        resolveLabel: (scope) =>
            scope === "CARD"
                ? "Pagamento de fatura"
                : scope === "WALLET"
                ? "Pagamento"
                : "Quitação",
        icon: CheckCircle2,
        badgeClassName:
            "border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10",
    },
    TRANSFER: {
        resolveLabel: () => "Transferência",
        icon: ArrowLeftRight,
        badgeClassName:
            "border-blue-500/30 text-blue-700 dark:text-blue-400 bg-blue-500/10",
    },
    ADJUSTMENT: {
        resolveLabel: () => "Ajuste",
        icon: SlidersHorizontal,
        badgeClassName:
            "border-amber-500/30 text-amber-700 dark:text-amber-400 bg-amber-500/10",
    },
    REVERSAL: {
        resolveLabel: () => "Estorno",
        icon: RotateCcw,
        badgeClassName:
            "border-rose-500/30 text-rose-700 dark:text-rose-400 bg-rose-500/10",
    },
};

