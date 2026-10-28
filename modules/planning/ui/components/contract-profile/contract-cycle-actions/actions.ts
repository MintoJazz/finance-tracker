import { RowAction } from "@/types/actions.types";
import { CheckCircle2, Pencil, Receipt, Trash2 } from "lucide-react";
import { ContractCycleItem } from "../../../../core/schemas/contract-cycle.schema";

export interface ContractCycleActionContext {
    onConsolidate: (cycle: ContractCycleItem) => void;
    onSettle: (cycle: ContractCycleItem) => void;
    onDiscard: (cycle: ContractCycleItem) => void;
    onAdjustValue: (cycle: ContractCycleItem) => void;
}

export const CONTRACT_CYCLE_ACTIONS: RowAction<ContractCycleItem, ContractCycleActionContext>[] = [
    {
        id: "consolidate",
        label: "Consolidar",
        icon: CheckCircle2,
        color: "emerald",
        onClick: (row, context) => context?.onConsolidate(row.original),
        hidden: (row) => row.original.status !== "PROJECTED",
    },
    {
        id: "settle",
        label: "Liquidar",
        icon: Receipt,
        color: "emerald",
        onClick: (row, context) => context?.onSettle(row.original),
        hidden: (row) =>
            row.original.status === "PROJECTED" || row.original.status === "PAID",
    },
    {
        id: "adjust-value",
        label: "Ajustar valor",
        icon: Pencil,
        color: "amber",
        onClick: (row, context) => context?.onAdjustValue(row.original),
        hidden: () => false,
    },
    {
        id: "discard",
        label: "Descartar",
        icon: Trash2,
        color: "rose",
        variant: "destructive",
        separatorBefore: true,
        onClick: (row, context) => context?.onDiscard(row.original),
        hidden: (row) => row.original.status !== "PROJECTED",
    },
];
