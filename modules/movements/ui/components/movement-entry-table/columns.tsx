"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
    MovementEntry,
    MovementEntryScope,
} from "@/modules/movements/models/movement-entry.schema";
import { MovementEntryAvatar } from "../movement-entry/movement-entry-avatar";
import { MovementEntrySubtitle } from "../movement-entry/movement-entry-subtitle";
import { MovementEntryAmount } from "../movement-entry/movement-entry-amount";
import { resolveMovementEntryTypeLabel } from "../movement-entry/presentation";

export function createMovementEntryColumns(
    scope: MovementEntryScope
): ColumnDef<MovementEntry, unknown>[] {
    return [
        {
            id: "date",
            header: "Data",
            accessorKey: "date",
            cell: ({ row }) => {
                const { date } = row.original;
                const dateObj = typeof date === "string" ? new Date(date) : date;
                return (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(dateObj)}
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
                const { description, hasAttachment, isReversed } = entry;

                return (
                    <div className="flex items-center gap-3 max-w-xs sm:max-w-sm xl:max-w-md min-w-0">
                        <MovementEntryAvatar
                            entry={entry}
                            scope={scope}
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
                                    title={description}
                                >
                                    {description}
                                </span>
                                {hasAttachment && (
                                    <span title="Possui anexo/comprovante">
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
                            <MovementEntrySubtitle entry={entry} scope={scope} />
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
                const typeLabel = resolveMovementEntryTypeLabel(entry, scope);

                return (
                    <div className="flex flex-col items-end">
                        <MovementEntryAmount entry={entry} scope={scope} />
                        <span className="text-xs text-muted-foreground">
                            {typeLabel}
                        </span>
                    </div>
                );
            },
        },
    ];
}

