import { CheckCircle2, Eye } from "lucide-react";
import type { RowAction } from "@/types/actions.types";
import type { CycleItem } from "@/modules/cycles/models/cycle-item.schema";

export interface RecurrenceCycleActionContext {
    onViewCycle?: (cycle: CycleItem) => void;
    onSettleCycle?: (cycle: CycleItem) => void;
}

export const RECURRENCE_CYCLE_ACTIONS: RowAction<
    CycleItem,
    RecurrenceCycleActionContext
>[] = [
    {
        id: "view",
        label: "Ver lançamentos",
        icon: Eye,
        onClick: (row, context) => context?.onViewCycle?.(row.original),
        hidden: (_row, context) => !context?.onViewCycle,
    },
    {
        id: "settle",
        label: "Liquidar / Registrar pagamento",
        icon: CheckCircle2,
        onClick: (row, context) => context?.onSettleCycle?.(row.original),
        hidden: (row, context) =>
            !context?.onSettleCycle ||
            row.original.status === "PAID" ||
            row.original.status === "SETTLED" ||
            row.original.status === "PROJECTED",
    },
];

