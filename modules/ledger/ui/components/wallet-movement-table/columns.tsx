import { ColumnDef } from "@tanstack/react-table";
import { Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { MovementAmountSpan } from "../movement-amount-span";
import { WalletMovementType, WalletMovement } from "@/modules/ledger/core/schemas/wallet-movement.schema";

const TYPE_CONFIG: Record<
    WalletMovementType,
    { label: string; className: string }
> = {
    INCOME: {
        label: "Receita",
        className:
            "border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10",
    },
    EXPENSE: {
        label: "Despesa",
        className:
            "border-rose-500/30 text-rose-700 dark:text-rose-400 bg-rose-500/10",
    },
    TRANSFER: {
        label: "Transferência",
        className:
            "border-blue-500/30 text-blue-700 dark:text-blue-400 bg-blue-500/10",
    },
    ADJUSTMENT: {
        label: "Ajuste",
        className:
            "border-amber-500/30 text-amber-700 dark:text-amber-400 bg-amber-500/10",
    },
    REVERSAL: {
        label: "Estorno",
        className:
            "border-purple-500/30 text-purple-700 dark:text-purple-400 bg-purple-500/10",
    },
};

export const MOVEMENT_COLUMNS: ColumnDef<WalletMovement, unknown>[] = [
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
            const { description, hasReceipt, isReversed } = row.original;
            return (
                <div className="flex items-center gap-2 max-w-xs sm:max-w-sm xl:max-w-md min-w-0">
                    <span
                        className={cn(
                            "truncate font-medium text-foreground text-sm",
                            isReversed && "line-through text-muted-foreground"
                        )}
                        title={description}
                    >
                        {description}
                    </span>
                    {hasReceipt && (
                        <span title="Possui comprovante anexo">
                            <Paperclip className="size-3.5 text-muted-foreground shrink-0" />
                        </span>
                    )}
                    {isReversed && (
                        <Badge
                            variant="outline"
                            className="text-[10px] text-muted-foreground border-dashed"
                        >
                            Estornada
                        </Badge>
                    )}
                </div>
            );
        },
    },
    {
        id: "type",
        header: "Tipo",
        accessorKey: "type",
        cell: ({ row }) => {
            const { type } = row.original;
            const config = TYPE_CONFIG[type] ?? {
                label: type,
                className: "border-border text-muted-foreground",
            };
            return (
                <Badge variant="outline" className={cn("text-xs font-normal", config.className)}>
                    {config.label}
                </Badge>
            );
        },
    },
    {
        id: "amount",
        header: "Valor",
        accessorKey: "amount",
        cell: ({ row }) => {
            const { amount, direction, isReversed } = row.original;
            return (
                <MovementAmountSpan
                    amount={amount}
                    direction={direction}
                    isReversed={isReversed}
                />
            );
        },
    },
];
