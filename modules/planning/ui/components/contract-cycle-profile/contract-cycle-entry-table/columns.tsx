"use client";

import * as React from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpRight, Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatMoney } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
    CategoryAvatar,
    getCategorySubtitle,
} from "@/modules/ledger/ui/components/category-badge";
import { MovementCategoryClassification } from "@/modules/ledger/core/schemas/wallet-movement.schema";
import {
    CycleEntryRow,
    CycleEntryType,
} from "../../../../core/schemas/contract-cycle.schema";

export const ENTRY_TYPE_CONFIG: Record<
    CycleEntryType,
    { label: string; className: string }
> = {
    provision: {
        label: "Provisão",
        className: "border-border text-muted-foreground bg-muted/40",
    },
    adjustment: {
        label: "Ajuste",
        className:
            "border-amber-500/30 text-amber-700 dark:text-amber-400 bg-amber-500/10",
    },
    settlement: {
        label: "Pagamento",
        className:
            "border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10",
    },
    claim_opening: {
        label: "Parcelamento",
        className:
            "border-indigo-500/30 text-indigo-700 dark:text-indigo-400 bg-indigo-500/10",
    },
    reversal: {
        label: "Estorno",
        className:
            "border-rose-500/30 text-rose-700 dark:text-rose-400 bg-rose-500/10",
    },
};

export function getEntryCategoryClassification(
    entry: CycleEntryRow
): MovementCategoryClassification {
    switch (entry.type) {
        case "provision":
            return {
                kind: "category",
                category: {
                    id: 1,
                    name: "Provisão",
                    appearance: { icon: "file-text", color: "sky" },
                },
            };
        case "adjustment":
            return {
                kind: "category",
                category: {
                    id: 2,
                    name: "Ajuste",
                    appearance: { icon: "sliders", color: "amber" },
                },
            };
        case "settlement":
            return {
                kind: "credit-settlement",
            };
        case "claim_opening":
            return {
                kind: "pass-through",
            };
        case "reversal":
            return {
                kind: "category",
                category: {
                    id: 3,
                    name: "Estorno",
                    appearance: { icon: "rotate-ccw", color: "rose" },
                },
            };
        default:
            return { kind: "none" };
    }
}

export const CONTRACT_CYCLE_ENTRY_COLUMNS: ColumnDef<CycleEntryRow, unknown>[] = [
    {
        id: "date",
        header: "Data",
        accessorKey: "date",
        cell: ({ row }) => {
            const { date } = row.original;
            return (
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(new Date(date))}
                </span>
            );
        },
    },
    {
        id: "description",
        header: "Descrição",
        accessorKey: "description",
        cell: ({ row }) => {
            const entry = row.original;
            const isReversed = Boolean(entry.reversedByEntryId);
            const classification = getEntryCategoryClassification(entry);
            const categorySubtitle = getCategorySubtitle(classification);

            return (
                <div className="flex items-center gap-3 max-w-xs sm:max-w-sm xl:max-w-md min-w-0">
                    <CategoryAvatar
                        classification={classification}
                        size="md"
                        className="shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <span
                                className={cn(
                                    "truncate font-medium text-foreground text-sm",
                                    isReversed && "line-through text-muted-foreground"
                                )}
                                title={entry.description}
                            >
                                {entry.description}
                            </span>
                            {entry.hasAttachment && (
                                <span title="Possui comprovante anexo">
                                    <Paperclip className="size-3.5 text-muted-foreground shrink-0" />
                                </span>
                            )}
                            {isReversed && (
                                <Badge
                                    variant="outline"
                                    className="text-[10px] text-muted-foreground border-dashed shrink-0"
                                >
                                    Estornada
                                </Badge>
                            )}
                        </div>
                        {entry.counterpart ? (
                            <Link
                                href={entry.counterpart.href}
                                className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline group truncate"
                            >
                                <span className="truncate">{entry.counterpart.label}</span>
                                <ArrowUpRight className="size-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0" />
                            </Link>
                        ) : (
                            <span
                                className="text-xs text-muted-foreground truncate"
                                title={categorySubtitle}
                            >
                                {categorySubtitle}
                            </span>
                        )}
                    </div>
                </div>
            );
        },
    },
    {
        id: "value",
        accessorKey: "amount",
        header: () => <div className="text-right">Valor</div>,
        cell: ({ row }) => {
            const entry = row.original;
            const isCredit =
                entry.direction === "CREDIT" ||
                entry.type === "settlement" ||
                entry.type === "reversal";
            const isReversed = Boolean(entry.reversedByEntryId);
            const typeLabel =
                ENTRY_TYPE_CONFIG[entry.type]?.label ?? "Lançamento";

            return (
                <div className="flex flex-col items-end">
                    <span
                        className={cn(
                            "font-medium font-mono tabular-nums",
                            isCredit && "text-emerald-500",
                            isReversed && "line-through opacity-50"
                        )}
                    >
                        {isCredit ? `- ${formatMoney(entry.amount)}` : formatMoney(entry.amount)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {typeLabel}
                    </span>
                </div>
            );
        },
    },
];
