import {
    ArrowDownLeft,
    ArrowUpRight,
    ArrowLeftRight,
    SlidersHorizontal,
    RotateCcw,
    CheckCircle2,
    ShoppingBag,
    FileText,
} from "lucide-react";
import { WalletMovementType } from "@/modules/movements/models/wallet-movement.schema";

export const MOVEMENT_TYPE_UI_CONFIG: Record<
    WalletMovementType,
    {
        label: string;
        icon: typeof ArrowDownLeft;
        iconClassName: string;
        badgeClassName: string;
    }
> = {
    INCOME: {
        label: "Receita",
        icon: ArrowDownLeft,
        iconClassName: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
        badgeClassName:
            "border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10",
    },
    EXPENSE: {
        label: "Despesa",
        icon: ArrowUpRight,
        iconClassName: "text-rose-600 dark:text-rose-400 bg-rose-500/10",
        badgeClassName:
            "border-rose-500/30 text-rose-700 dark:text-rose-400 bg-rose-500/10",
    },
    PURCHASE: {
        label: "Compra",
        icon: ShoppingBag,
        iconClassName: "text-zinc-600 dark:text-zinc-400 bg-zinc-500/10",
        badgeClassName: "border-border text-foreground bg-muted/40",
    },
    PROVISION: {
        label: "Provisão",
        icon: FileText,
        iconClassName: "text-sky-600 dark:text-sky-400 bg-sky-500/10",
        badgeClassName:
            "border-sky-500/30 text-sky-700 dark:text-sky-400 bg-sky-500/10",
    },
    SETTLEMENT: {
        label: "Pagamento",
        icon: CheckCircle2,
        iconClassName: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
        badgeClassName:
            "border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10",
    },
    TRANSFER: {
        label: "Transferência",
        icon: ArrowLeftRight,
        iconClassName: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
        badgeClassName:
            "border-blue-500/30 text-blue-700 dark:text-blue-400 bg-blue-500/10",
    },
    ADJUSTMENT: {
        label: "Ajuste",
        icon: SlidersHorizontal,
        iconClassName: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
        badgeClassName:
            "border-amber-500/30 text-amber-700 dark:text-amber-400 bg-amber-500/10",
    },
    REVERSAL: {
        label: "Estorno",
        icon: RotateCcw,
        iconClassName: "text-purple-600 dark:text-purple-400 bg-purple-500/10",
        badgeClassName:
            "border-purple-500/30 text-purple-700 dark:text-purple-400 bg-purple-500/10",
    },
};
