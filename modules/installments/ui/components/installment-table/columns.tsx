"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { AmountSpan } from "@/components/amount-span";
import { formatMoney } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
    getRemainingAmount,
    isInstallmentPaid,
    type InstallmentListItem,
} from "@/modules/installments/models/schemas/installment-item.schema";
import {
    formatInstallmentNextDue,
    getInstallmentSourceLabel,
} from "@/modules/installments/ui/themes/installment.themes";
import { InstallmentAvatar } from "../installment-avatar";
import { InstallmentProgress } from "../installment-progress";
import { InstallmentStatusBadge } from "../installment-status-badge";

export const INSTALLMENT_COLUMNS: ColumnDef<InstallmentListItem>[] = [
    {
        id: "description",
        header: "Descrição",
        accessorKey: "description",
        cell: ({ row }) => {
            const item = row.original;
            return (
                <div className="flex items-center gap-3 min-w-0">
                    <InstallmentAvatar item={item} size="md" />
                    <div className="flex flex-col min-w-0">
                        <span
                            className={cn(
                                "truncate font-medium text-foreground",
                                isInstallmentPaid(item) && "text-muted-foreground"
                            )}
                            title={item.description}
                        >
                            {item.description}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                            {item.category?.name ?? "Sem categoria"} •{" "}
                            {getInstallmentSourceLabel(item)}
                        </span>
                    </div>
                </div>
            );
        },
    },
    {
        id: "progress",
        header: "Progresso",
        cell: ({ row }) => <InstallmentProgress item={row.original} />,
    },
    {
        id: "nextDueDate",
        header: "Próx. vencimento",
        accessorKey: "nextDueDate",
        cell: ({ row }) => (
            <span className="text-muted-foreground text-sm tabular-nums">
                {formatInstallmentNextDue(row.original)}
            </span>
        ),
    },
    {
        id: "status",
        header: "Status",
        cell: ({ row }) => <InstallmentStatusBadge item={row.original} />,
    },
    {
        id: "installmentAmount",
        header: () => <div className="text-right">Parcela</div>,
        accessorKey: "installmentAmount",
        cell: ({ row }) => {
            const item = row.original;
            const paid = isInstallmentPaid(item);
            const remaining = getRemainingAmount(item);
            return (
                <div className="flex flex-col items-end min-w-0">
                    <AmountSpan
                        className="text-right"
                        amount={item.installmentAmount}
                        isNegative={!paid}
                        isCancelled={paid}
                    />
                    {!paid && remaining > 0 && (
                        <span className="truncate text-xs text-muted-foreground tabular-nums">
                            Restam {formatMoney(remaining)}
                        </span>
                    )}
                </div>
            );
        },
    },
];
