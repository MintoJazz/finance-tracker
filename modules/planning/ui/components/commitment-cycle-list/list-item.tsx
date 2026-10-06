// modules/planning/ui/components/commitment-cycle-list/list-item.tsx
import { Calendar, CreditCard, FileText, MoreHorizontal } from "lucide-react";
import { AmountSpan } from "@/components/amount-span";
import { BalanceAvatar } from "@/components/balance-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatMoney } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
    COMMITMENT_SOURCE_TYPE_REGISTRY,
    COMMITMENT_STATUS_REGISTRY,
} from "../../../core/registries/commitment-cycle.registry";
import { CommitmentCycleItem } from "../../../core/schemas/commitment-cycle.schema";

interface Props {
    item: CommitmentCycleItem;
    onSelect?: () => void;
    onOpenActions: () => void;
    className?: string;
}

export default function CommitmentCycleListItem({
    item,
    onSelect,
    onOpenActions,
    className,
}: Props) {
    const {
        balanceName,
        balanceType,
        label,
        dueDate,
        status,
        totalAmount,
        paidAmount,
        remainingAmount,
    } = item;

    const statusMeta = COMMITMENT_STATUS_REGISTRY[status];
    const sourceMeta = COMMITMENT_SOURCE_TYPE_REGISTRY[balanceType];
    const SourceIcon = balanceType === "CREDIT" ? CreditCard : FileText;
    const isPaid = status === "PAID";
    const isOverdue = status === "OVERDUE";
    const displayAmount = isPaid ? totalAmount : remainingAmount;

    return (
        <div
            data-slot="item"
            tabIndex={onSelect ? 0 : undefined}
            onClick={onSelect}
            onKeyDown={
                onSelect
                    ? (e) => {
                          if (e.target !== e.currentTarget) return;
                          if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              onSelect();
                          }
                      }
                    : undefined
            }
            className={cn(
                "group/item flex w-full flex-col gap-2 px-4 py-3 hover:bg-muted/40 transition-colors text-sm",
                onSelect &&
                    "cursor-pointer focus-visible:outline-none focus-visible:bg-muted/40",
                className
            )}
        >
            {/* Linha 1: Avatar + Nome + Badge Status + Botão de Ações */}
            <div className="flex items-center justify-between gap-3 w-full">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <BalanceAvatar name={balanceName} size="md" />
                    <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="truncate font-medium text-foreground text-sm">
                                {balanceName}
                            </span>
                            <Badge
                                variant="outline"
                                className={cn(
                                    "text-[10px] px-1.5 py-0 shrink-0",
                                    statusMeta.badgeClassName
                                )}
                            >
                                {statusMeta.label}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                            <SourceIcon className="size-3 shrink-0" />
                            <span>{sourceMeta.shortLabel}</span>
                            <span>•</span>
                            <span>{label}</span>
                        </div>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="ghost"
                    className="h-8 w-8 p-0 shrink-0"
                    onClick={(e) => {
                        e.stopPropagation();
                        onOpenActions();
                    }}
                >
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </div>

            {/* Linha 2: Data de Vencimento à esquerda + Valor à direita */}
            <div className="flex items-center justify-between gap-3 w-full text-xs text-muted-foreground">
                <div
                    className={cn(
                        "flex items-center gap-1.5 min-w-0",
                        isOverdue && "text-rose-600 dark:text-rose-400 font-medium"
                    )}
                >
                    <Calendar className="size-3.5 shrink-0" />
                    <span className="truncate">
                        Vence em {formatDate(dueDate)}
                    </span>
                </div>

                <div className="flex items-baseline gap-1.5 shrink-0">
                    {status === "PARTIAL" && (
                        <span className="text-[11px] text-muted-foreground tabular-nums">
                            (Pago {formatMoney(paidAmount)})
                        </span>
                    )}
                    <AmountSpan
                        amount={displayAmount}
                        isPositive={isPaid}
                        isNegative={isOverdue}
                    />
                </div>
            </div>
        </div>
    );
}