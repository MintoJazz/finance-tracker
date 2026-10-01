import { CardSummary } from "@/modules/account/core/schemas/card.schema";
import { CARD_ACTIONS, CardActionContext } from "../../config/card-actions-menu";
import { ActionsMenu } from "@/components/actions-menu";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/formatters";
import { Calendar } from "lucide-react";
import { cn } from "cn";
import BalanceAvatar from "../balance-avatar";

interface Props {
    card: CardSummary;
    context: CardActionContext;
    className?: string;
}

export default function CardListItem({ card, context, className }: Props) {
    const { name, availableLimit, dueDay, isArchived } = card;

    return (
        <div
            data-slot="item"
            className={cn(
                "group/item flex w-full flex-col gap-2 px-4 py-3 hover:bg-muted/40 transition-colors text-sm",
                isArchived && "opacity-75",
                className
            )}
        >
            {/* Linha 1: Avatar + Nome + Badge Arquivado + Actions */}
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

                <div className="flex items-center gap-2 shrink-0">
                    <ActionsMenu row={card} actions={CARD_ACTIONS} context={context} />
                </div>
            </div>

            {/* Linha 2: Vencimento à esquerda + Limite à direita */}
            <div className="flex items-center justify-between gap-3 w-full text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 min-w-0">
                    <Calendar className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">
                        Vence dia {dueDay}
                    </span>
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
