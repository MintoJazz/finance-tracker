import * as React from "react";
import {
    EntityHeader,
    EntityHeaderMedia,
    EntityHeaderContent,
    EntityHeaderTitle,
    EntityHeaderDescription,
} from "@/components/entity-header";
import { formatDate, formatMoney } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CategoryAvatar } from "@/modules/ledger/ui/components/category-badge";
import { CycleEntryRow } from "../../../../core/schemas/contract-cycle.schema";
import {
    ENTRY_TYPE_CONFIG,
    getEntryCategoryClassification,
} from "../contract-cycle-entry-table/columns";

interface ContractCycleEntryActionsDrawerHeaderProps {
    entry: CycleEntryRow;
}

export function ContractCycleEntryActionsDrawerHeader({
    entry,
}: ContractCycleEntryActionsDrawerHeaderProps) {
    const isReversed = Boolean(entry.reversedByEntryId);
    const isCredit =
        entry.direction === "CREDIT" ||
        entry.type === "SETTLEMENT" ||
        entry.type === "CLAIM_PAYMENT" ||
        entry.type === "REVERSAL";
    const classification = getEntryCategoryClassification(entry);
    const typeLabel = ENTRY_TYPE_CONFIG[entry.type]?.label ?? "Lançamento";

    return (
        <EntityHeader>
            <EntityHeaderMedia>
                <CategoryAvatar
                    classification={classification}
                    size="md"
                    className={cn(isReversed && "opacity-60")}
                />
            </EntityHeaderMedia>
            <EntityHeaderContent>
                <div className="flex items-center gap-1.5 min-w-0">
                    <EntityHeaderTitle
                        className={cn(
                            isReversed && "line-through text-muted-foreground"
                        )}
                    >
                        {entry.description}
                    </EntityHeaderTitle>
                    {isReversed && (
                        <Badge
                            variant="outline"
                            className="text-[10px] text-muted-foreground border-dashed shrink-0"
                        >
                            Estornada
                        </Badge>
                    )}
                </div>
                <EntityHeaderDescription className="flex items-center gap-2 mt-0.5">
                    <span
                        className={cn(
                            "font-medium font-mono tabular-nums text-foreground",
                            isCredit && "text-emerald-500",
                            isReversed &&
                                "line-through opacity-60 text-muted-foreground"
                        )}
                    >
                        {isCredit
                            ? `- ${formatMoney(entry.amount)}`
                            : formatMoney(entry.amount)}
                    </span>
                    <span>•</span>
                    <span>{formatDate(new Date(entry.date))}</span>
                    <span>•</span>
                    <span>{typeLabel}</span>
                </EntityHeaderDescription>
            </EntityHeaderContent>
        </EntityHeader>
    );
}
