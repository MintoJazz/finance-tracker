import { RowAction } from "@/types/actions.types";
import { ArrowUpRight, Info, Paperclip, Receipt, RotateCcw } from "lucide-react";
import {
    CycleEntryRow,
    CycleRange,
} from "../../../../core/schemas/contract-cycle.schema";

export interface CycleEntryActionContext {
    contractId?: number;
    cycleRange?: CycleRange;
    onViewEntry?: (entry: CycleEntryRow) => void;
    onViewReceipt?: (entry: CycleEntryRow) => void;
    onAttachReceipt?: (entry: CycleEntryRow) => void;
    onOpenCounterpart?: (entry: CycleEntryRow) => void;
    onReverseEntry?: (entry: CycleEntryRow) => void;
}

export const CONTRACT_CYCLE_ENTRY_ACTIONS: RowAction<
    CycleEntryRow,
    CycleEntryActionContext
>[] = [
    {
        id: "view-entry",
        label: "Ver detalhes",
        icon: Info,
        onClick: (row, context) => context?.onViewEntry?.(row.original),
    },
    {
        id: "open-counterpart",
        label: "Abrir contraparte",
        icon: ArrowUpRight,
        onClick: (row, context) => {
            if (context?.onOpenCounterpart) {
                context.onOpenCounterpart(row.original);
            } else if (
                row.original.counterpart?.href &&
                typeof window !== "undefined"
            ) {
                window.location.href = row.original.counterpart.href;
            }
        },
        hidden: (row) => !row.original.counterpart,
    },
    {
        id: "view-receipt",
        label: "Ver comprovante",
        icon: Receipt,
        onClick: (row, context) => context?.onViewReceipt?.(row.original),
        hidden: (row) => !row.original.hasAttachment,
    },
    {
        id: "attach-receipt",
        label: "Anexar comprovante",
        icon: Paperclip,
        onClick: (row, context) => context?.onAttachReceipt?.(row.original),
        hidden: (row) => row.original.hasAttachment,
    },
    {
        id: "reverse",
        label: "Estornar lançamento",
        icon: RotateCcw,
        variant: "destructive",
        separatorBefore: true,
        confirmTitle: "Estornar lançamento",
        confirmDescription: "Tem certeza que deseja estornar este lançamento?",
        onClick: (row, context) => context?.onReverseEntry?.(row.original),
        hidden: (row) =>
            row.original.type === "reversal" ||
            Boolean(row.original.reversedByEntryId),
    },
];

export function buildCycleEntryActions(): RowAction<CycleEntryRow, CycleEntryActionContext>[] {
    return CONTRACT_CYCLE_ENTRY_ACTIONS;
}
