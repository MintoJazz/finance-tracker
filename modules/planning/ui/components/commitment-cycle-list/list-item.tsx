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
import {
    ListItem,
    ListItemHeader,
    ListItemAvatar,
    ListItemContent,
    ListItemTitle,
    ListItemSubtitle,
    ListItemActions,
    ListItemFooter,
    ListItemFooterLeft,
    ListItemFooterRight,
    ListItemFooterInfo
} from "@/components/list-item";

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
        <ListItem onSelect={onSelect} className={className}>
            <ListItemHeader>
                <ListItemAvatar>
                    <BalanceAvatar name={balanceName} size="md" />
                </ListItemAvatar>
                <ListItemContent>
                    <ListItemTitle>
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
                    </ListItemTitle>
                    <ListItemSubtitle>
                        <SourceIcon className="size-3 shrink-0" />
                        <span>{sourceMeta.shortLabel}</span>
                        <span>•</span>
                        <span>{label}</span>
                    </ListItemSubtitle>
                </ListItemContent>

                <ListItemActions>
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
                </ListItemActions>
            </ListItemHeader>

            <ListItemFooter>
                <ListItemFooterLeft className={cn(isOverdue && "text-rose-600 dark:text-rose-400 font-medium")}>
                    <ListItemFooterInfo icon={Calendar}>
                        Vence em {formatDate(dueDate)}
                    </ListItemFooterInfo>
                </ListItemFooterLeft>

                <ListItemFooterRight>
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
                </ListItemFooterRight>
            </ListItemFooter>
        </ListItem>
    );
}