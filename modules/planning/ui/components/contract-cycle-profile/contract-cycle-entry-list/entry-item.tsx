"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Calendar, MoreHorizontal, Paperclip, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatMoney } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
    ListItem,
    ListItemHeader,
    ListItemAvatar,
    ListItemContent,
    ListItemTitle,
    ListItemActions,
    ListItemFooter,
    ListItemFooterLeft,
    ListItemFooterRight,
    ListItemFooterInfo,
} from "@/components/list-item";
import {
    CategoryAvatar,
    getCategorySubtitle,
} from "@/modules/ledger/ui/components/category-badge";
import { CycleEntryRow } from "../../../../core/schemas/contract-cycle.schema";
import {
    ENTRY_TYPE_CONFIG,
    getEntryCategoryClassification,
} from "../contract-cycle-entry-table/columns";

interface ContractCycleEntryListItemProps {
    entry: CycleEntryRow;
    onOpenActions: () => void;
    className?: string;
}

export function ContractCycleEntryListItem({
    entry,
    onOpenActions,
    className,
}: ContractCycleEntryListItemProps) {
    const isReversed = Boolean(entry.reversedByEntryId);
    const isCredit =
        entry.direction === "CREDIT" ||
        entry.type === "settlement" ||
        entry.type === "reversal";
    const classification = getEntryCategoryClassification(entry);
    const categorySubtitle = getCategorySubtitle(classification);
    const typeLabel = ENTRY_TYPE_CONFIG[entry.type]?.label ?? "Lançamento";

    return (
        <ListItem className={cn(isReversed && "opacity-75", className)}>
            <ListItemHeader>
                <ListItemAvatar>
                    <CategoryAvatar
                        classification={classification}
                        size="md"
                    />
                </ListItemAvatar>
                <ListItemContent>
                    <ListItemTitle>
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
                                    className="text-xs text-muted-foreground truncate font-normal"
                                    title={categorySubtitle}
                                >
                                    {categorySubtitle}
                                </span>
                            )}
                        </div>
                    </ListItemTitle>
                </ListItemContent>
                <ListItemActions>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 p-0 text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpenActions();
                        }}
                        aria-label={`Ações do lançamento ${entry.description}`}
                    >
                        <MoreHorizontal className="size-4" />
                    </Button>
                </ListItemActions>
            </ListItemHeader>

            <ListItemFooter>
                <ListItemFooterLeft>
                    <ListItemFooterInfo icon={Calendar}>
                        {formatDate(new Date(entry.date))}
                    </ListItemFooterInfo>
                    <ListItemFooterInfo icon={Tag}>
                        {typeLabel}
                    </ListItemFooterInfo>
                </ListItemFooterLeft>
                <ListItemFooterRight>
                    <span
                        className={cn(
                            "font-medium font-mono tabular-nums text-sm",
                            isCredit && "text-emerald-500",
                            isReversed && "line-through opacity-50 text-muted-foreground"
                        )}
                    >
                        {isCredit ? `- ${formatMoney(entry.amount)}` : formatMoney(entry.amount)}
                    </span>
                </ListItemFooterRight>
            </ListItemFooter>
        </ListItem>
    );
}

export default ContractCycleEntryListItem;
