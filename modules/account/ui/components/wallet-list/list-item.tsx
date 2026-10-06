// modules/account/ui/components/wallet-list/list-item.tsx
import { WalletSummary } from "@/modules/account/core/schemas/wallet.schema";
import { AmountSpan } from "@/components/amount-span";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/formatters";
import { Calendar, MoreHorizontal } from "lucide-react";
import { cn } from "cn";
import BalanceAvatar from "../balance-avatar";

interface Props {
    wallet: WalletSummary;
    className?: string;
    onOpenActions: () => void;
    onSelect?: () => void;
}

export default function WalletListItem({
    wallet,
    className,
    onOpenActions,
    onSelect,
}: Props) {
    const { name, amount, lastActivityAt, isArchived } = wallet;

    return (
        <div
            data-slot="item"
            role={onSelect ? "link" : undefined}
            tabIndex={onSelect ? 0 : undefined}
            onClick={
                onSelect
                    ? (e) => {
                          if (!e.currentTarget.contains(e.target as Node)) return;
                          onSelect();
                      }
                    : undefined
            }
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
                isArchived && "opacity-75",
                className
            )}
        >
            <div className="flex items-center justify-between gap-3 w-full">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <BalanceAvatar name={name} isArchived={isArchived} size="md" />
                    <div className="flex items-center gap-2 min-w-0">
                        <span
                            className={cn(
                                "truncate font-medium text-foreground text-sm",
                                isArchived && "text-muted-foreground"
                            )}
                        >
                            {name}
                        </span>
                        {isArchived && (
                            <Badge variant="outline" className="text-muted-foreground">
                                Arquivada
                            </Badge>
                        )}
                    </div>
                </div>
                <div
                    className="flex items-center gap-2 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <Button
                        type="button"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpenActions();
                        }}
                    >
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <div className="flex items-center justify-between gap-3 w-full text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 min-w-0">
                    <Calendar className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">
                        {lastActivityAt
                            ? `Última atividade: ${formatDate(new Date(lastActivityAt))}`
                            : "Sem atividade recente"}
                    </span>
                </div>
                <AmountSpan
                    amount={amount}
                    isNegative={amount < 0}
                    isPositive={amount > 0}
                    isCancelled={isArchived}
                />
            </div>
        </div>
    );
}