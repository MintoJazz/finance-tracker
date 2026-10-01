import { AmountSpan } from "@/components/amount-span";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/formatters";
import { WalletSummary } from "@/modules/account/core/schemas/wallet.schema";
import { ColumnDef } from "@tanstack/react-table";
import { cn } from "cn";
import BalanceAvatar from "../balance-avatar";

export const WALLET_COLUMNS: ColumnDef<WalletSummary>[] = [
    {
        id: "name",
        header: "Nome",
        accessorKey: "name",
        cell: ({ row }) => {
            const wallet = row.original;
            return (
                <div className="flex items-center gap-3">
                    <BalanceAvatar name={wallet.name} isArchived={wallet.isArchived} size="md" />
                    <div className="flex items-center gap-2">
                        <span
                            className={cn(
                                "font-medium text-foreground",
                                wallet.isArchived && "text-muted-foreground",
                            )}
                        >
                            {wallet.name}
                        </span>
                        {wallet.isArchived && (
                            <Badge variant="outline" className="text-muted-foreground">
                                Arquivada
                            </Badge>
                        )}
                    </div>
                </div>
            );
        },
    },
    {
        id: "balance",
        header: "Saldo",
        accessorKey: "amount",
        cell: ({ row }) => {
            const { amount, isArchived } = row.original;
            const isNegative = amount < 0;
            const isPositive = amount > 0;

            return (
                <AmountSpan
                    amount={amount}
                    isNegative={isNegative}
                    isPositive={isPositive}
                    isCancelled={isArchived}
                />
            );
        },
    },
    {
        id: "lastActivityAt",
        header: "Última Atividade",
        accessorKey: "lastActivityAt",
        cell: ({ row }) => {
            const { lastActivityAt } = row.original;
            if (!lastActivityAt) {
                return <span className="text-muted-foreground text-xs">—</span>;
            }

            return (
                <span className="text-muted-foreground text-sm">
                    {formatDate(new Date(lastActivityAt))}
                </span>
            );
        },
    },
];