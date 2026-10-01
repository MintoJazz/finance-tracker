import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/formatters";
import { CardSummary } from "@/modules/account/core/schemas/card.schema";
import { ColumnDef } from "@tanstack/react-table";
import { cn } from "cn";
import BalanceAvatar from "../balance-avatar";

export const CARD_COLUMNS: ColumnDef<CardSummary>[] = [
    {
        id: "name",
        header: "Nome",
        accessorKey: "name",
        cell: ({ row }) => {
            const card = row.original;
            return (
                <div className="flex items-center gap-3">
                    <BalanceAvatar name={card.name} isArchived={card.isArchived} size="md" />
                    <div className="flex items-center gap-2">
                        <span
                            className={cn(
                                "font-medium text-foreground",
                                card.isArchived && "text-muted-foreground",
                            )}
                        >
                            {card.name}
                        </span>
                        {card.isArchived && (
                            <Badge variant="outline" className="text-muted-foreground">
                                Arquivado
                            </Badge>
                        )}
                    </div>
                </div>
            );
        },
    },
    {
        id: "closingDay",
        header: "Fechamento",
        accessorKey: "closingDay",
        cell: ({ row }) => {
            const { closingDay } = row.original;
            return (
                <span className="text-muted-foreground text-sm">
                    {closingDay ? `Dia ${closingDay}` : "—"}
                </span>
            );
        },
    },
    {
        id: "dueDay",
        header: "Vencimento",
        accessorKey: "dueDay",
        cell: ({ row }) => {
            const { dueDay } = row.original;
            return (
                <span className="text-muted-foreground text-sm">
                    Dia {dueDay}
                </span>
            );
        },
    },
    {
        id: "limit",
        header: "Limite",
        accessorKey: "limit",
        cell: ({ row }) => {
            const { limit, isArchived } = row.original;
            return (
                <span className={cn("text-muted-foreground text-sm font-mono tabular-nums", isArchived && "opacity-60")}>
                    {formatMoney(limit)}
                </span>
            );
        },
    },
];
