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
} from "@/modules/movements/ui/components/category-badge";
import { MovementCategoryClassification } from "@/modules/movements/models/wallet-movement.schema";
import {
    CycleEntryRow,
    EntryTypeEnum,
} from "@/modules/cycles/models/contract-cycle.schema";

export const ENTRY_TYPE_CONFIG: Record<
    EntryTypeEnum,
    { label: string; className: string }
> = {
    ACCRUAL: {
        label: "Provisão",
        className: "border-border text-muted-foreground bg-muted/40",
    },
    ADJUSTMENT: {
        label: "Ajuste",
        className:
            "border-amber-500/30 text-amber-700 dark:text-amber-400 bg-amber-500/10",
    },
    SETTLEMENT: {
        label: "Pagamento",
        className:
            "border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10",
    },
    CLAIM_PAYMENT: {
        label: "Pagamento",
        className:
            "border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10",
    },
    CLAIM_RECEIPT: {
        label: "Recebimento",
        className:
            "border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10",
    },
    CLAIM_OPENING: {
        label: "Parcelamento",
        className:
            "border-indigo-500/30 text-indigo-700 dark:text-indigo-400 bg-indigo-500/10",
    },
    CLAIM_ACCEPTANCE: {
        label: "Repactuação",
        className:
            "border-indigo-500/30 text-indigo-700 dark:text-indigo-400 bg-indigo-500/10",
    },
    REVERSAL: {
        label: "Estorno",
        className:
            "border-rose-500/30 text-rose-700 dark:text-rose-400 bg-rose-500/10",
    },
    DIRECT: {
        label: "Direto",
        className: "border-border text-muted-foreground bg-muted/40",
    },
    TRANSFER: {
        label: "Transferência",
        className: "border-border text-muted-foreground bg-muted/40",
    },
};

export function getEntryCategoryClassification(
    entry: CycleEntryRow
): MovementCategoryClassification {
    switch (entry.type) {
        case "ACCRUAL":
            return {
                kind: "category",
                category: {
                    id: 1,
                    name: "Provisão",
                    appearance: { icon: "file-text", color: "sky" },
                },
            };
        case "ADJUSTMENT":
            return {
                kind: "category",
                category: {
                    id: 2,
                    name: "Ajuste",
                    appearance: { icon: "sliders", color: "amber" },
                },
            };
        case "SETTLEMENT":
        case "CLAIM_PAYMENT":
        case "CLAIM_RECEIPT":
            return {
                kind: "credit-settlement",
            };
        case "CLAIM_OPENING":
        case "CLAIM_ACCEPTANCE":
        case "TRANSFER":
            return {
                kind: "pass-through",
            };
        case "REVERSAL":
            return {
                kind: "category",
                category: {
                    id: 3,
                    name: "Estorno",
                    appearance: { icon: "rotate-ccw", color: "rose" },
                },
            };
        case "DIRECT":
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
                entry.type === "SETTLEMENT" ||
                entry.type === "CLAIM_PAYMENT" ||
                entry.type === "REVERSAL";
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
