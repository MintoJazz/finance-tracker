import { CardSummary } from "@/modules/account/core/schemas/card.schema";
import { BalanceAvatar } from "@/components/balance-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/formatters";
import { Calendar, MoreHorizontal } from "lucide-react";
import { cn } from "cn";

interface Props {
    card: CardSummary;
    onOpenActions: () => void;
    onSelect?: () => void;
    className?: string;
}

export default function CardListItem({
    card,
    onOpenActions,
    onSelect,
    className,
}: Props) {
    const { name, availableLimit, dueDay, isArchived } = card;

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
            {/* Linha 1: Avatar + Nome + Badge Arquivado + Botão Actions */}
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
                                Arquivado
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

            {/* Linha 2: Vencimento à esquerda + Limite à direita */}
            <div className="flex items-center justify-between gap-3 w-full text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 min-w-0">
                    <Calendar className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">Vence dia {dueDay}</span>
                </div>
                <span
                    className={cn(
                        "font-medium font-mono tabular-nums text-foreground",
                        isArchived && "text-muted-foreground"
                    )}
                >
                    {formatMoney(availableLimit)}
                </span>
            </div>
        </div>
    );
}