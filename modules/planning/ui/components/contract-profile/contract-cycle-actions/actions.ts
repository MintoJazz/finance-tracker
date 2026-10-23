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
        onClick: (row, context) => context?.onConsolidate(row.original),
        hidden: (row) => row.original.kind !== "PROJECTED",
    },
    {
        id: "settle",
        label: "Liquidar",
        icon: Receipt,
        onClick: (row, context) => context?.onSettle(row.original),
        hidden: (row) => row.original.kind !== "CONSOLIDATED" || row.original.status === "PAID",
    },
    {
        id: "adjust-value",
        label: "Ajustar valor",
        icon: Pencil,
        onClick: (row, context) => context?.onAdjustValue(row.original),
        hidden: () => false,
    },
    {
        id: "discard",
        label: "Descartar",
        icon: Trash2,
        variant: "destructive",
        separatorBefore: true,
        onClick: (row, context) => context?.onDiscard(row.original),
        hidden: (row) => row.original.kind !== "PROJECTED",
    },
];
