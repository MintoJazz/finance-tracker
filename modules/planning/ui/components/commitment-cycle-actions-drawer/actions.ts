import { CheckCircle2, Eye } from "lucide-react";
import { RowAction } from "@/types/actions.types";
import { CommitmentCycleItem } from "@/modules/planning/core/schemas/commitment-cycle.schema";

export interface CommitmentCycleActionContext {
    onViewDetails?: (item: CommitmentCycleItem) => void;
    onSettle?: (item: CommitmentCycleItem) => void;
}

export const COMMITMENT_CYCLE_ACTIONS: RowAction<
    CommitmentCycleItem,
    CommitmentCycleActionContext
>[] = [
    {
        id: "view-details",
        label: "Ver detalhes",
        icon: Eye,
        onClick: (row, context) => context?.onViewDetails?.(row.original),
        hidden: (_row, context) => !context?.onViewDetails,
    },
    {
        id: "settle",
        label: "Dar baixa / Pagar",
        icon: CheckCircle2,
        onClick: (row, context) => context?.onSettle?.(row.original),
        hidden: (row, context) =>
            row.original.status === "PAID" || !context?.onSettle,
    },
];