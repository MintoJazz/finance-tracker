import {
    ArrowDownLeft,
    ArrowLeftRight,
    ArrowUpRight,
    RotateCcw,
    SlidersHorizontal,
} from "lucide-react";
import {
    EntityHeader,
    EntityHeaderMedia,
    EntityHeaderContent,
    EntityHeaderTitle,
    EntityHeaderDescription,
} from "@/components/entity-header";
import { formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
    WalletMovement,
    WalletMovementType,
} from "@/modules/ledger/core/schemas/wallet-movement.schema";
import { MovementAmountSpan } from "../movement-amount-span";

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

interface WalletMovementActionsDrawerHeaderProps {
    movement: WalletMovement;
}

export function WalletMovementActionsDrawerHeader({
    movement,
}: WalletMovementActionsDrawerHeaderProps) {
    const { description, date, type, direction, amount, isReversed } = movement;
    const config = MOVEMENT_TYPE_UI_CONFIG[type];
    const IconComponent = config.icon;

    return (
        <EntityHeader>
            <EntityHeaderMedia>
                <div
                    className={cn(
                        "flex size-12 shrink-0 items-center justify-center rounded-xl border border-border/60 select-none",
                        config.iconClassName
                    )}
                >
                    <IconComponent className="size-5" />
                </div>
            </EntityHeaderMedia>
            <EntityHeaderContent>
                <EntityHeaderTitle>{description}</EntityHeaderTitle>
                <div className="mt-0.5">
                    <MovementAmountSpan
                        amount={amount}
                        direction={direction}
                        isReversed={isReversed}
                    />
                </div>
                <EntityHeaderDescription>
                    {config.label} • {formatDate(new Date(date))}
                </EntityHeaderDescription>
            </EntityHeaderContent>
        </EntityHeader>
    );
}