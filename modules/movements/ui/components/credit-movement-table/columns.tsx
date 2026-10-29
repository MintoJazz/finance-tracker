import { ColumnDef } from "@tanstack/react-table";
import { Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatMoney } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { WalletMovement } from "@/modules/movements/models/wallet-movement.schema";
import { MOVEMENT_TYPE_UI_CONFIG } from "../../themes/movement-type";
import {
    CategoryAvatar,
    getCategorySubtitle,
} from "../category-badge";

export const CREDIT_MOVEMENT_COLUMNS: ColumnDef<WalletMovement, unknown>[] = [
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
            const {
                description,
                hasReceipt,
                isReversed,
                direction,
                type,
                categoryClassification,
            } = row.original;

            const isCreditOnInvoice = direction === "CREDIT" || type === "REVERSAL";
            const categorySubtitle = getCategorySubtitle(categoryClassification);
            const subtitle = isCreditOnInvoice
                ? categoryClassification && categoryClassification.kind !== "none"
                    ? `${categorySubtitle} • Crédito na fatura`
                    : "Crédito na fatura"
                : categorySubtitle;

            return (
                <div className="flex items-center gap-3 max-w-xs sm:max-w-sm xl:max-w-md min-w-0">
                    <CategoryAvatar
                        classification={categoryClassification}
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
                            {hasReceipt && (
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
                        <span
                            className="text-xs text-muted-foreground truncate"
                            title={subtitle}
                        >
                            {subtitle}
                        </span>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "value",
        header: () => <div className="text-right">Valor</div>,
        cell: ({ row }) => {
            const { amount, direction, isReversed, type } = row.original;
            const isCreditOnInvoice = direction === "CREDIT" || type === "REVERSAL";
            const { label } = MOVEMENT_TYPE_UI_CONFIG[type] ?? {
                label: isCreditOnInvoice ? "Crédito" : "Compra",
                className: "border-border text-muted-foreground",
            };

            return (
                <div className="flex flex-col items-end">
                    <span
                        className={cn(
                            "font-medium font-mono tabular-nums",
                            isCreditOnInvoice && "text-emerald-500",
                            isReversed && "line-through opacity-50"
                        )}
                    >
                        {isCreditOnInvoice ? `- ${formatMoney(amount)}` : formatMoney(amount)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {isCreditOnInvoice ? "Crédito na fatura" : label}
                    </span>
                </div>
            );
        },
    },
];
