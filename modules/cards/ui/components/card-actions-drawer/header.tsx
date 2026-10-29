import {
    EntityHeader,
    EntityHeaderMedia,
    EntityHeaderContent,
    EntityHeaderTitle,
    EntityHeaderDescription,
} from "@/components/entity-header";
import { formatMoney } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import BalanceAvatar from "@/components/balance-avatar";
import { CardSummary } from "@/modules/cards/models/card.schema";

interface CardActionsDrawerHeaderProps {
    card: CardSummary;
}

export function CardActionsDrawerHeader({ card }: CardActionsDrawerHeaderProps) {
    const { name, availableLimit, dueDay, isArchived } = card;

    return (
        <EntityHeader>
            <EntityHeaderMedia>
                <BalanceAvatar name={name} isArchived={isArchived} size="lg" />
            </EntityHeaderMedia>
            <EntityHeaderContent>
                <EntityHeaderTitle>{name}</EntityHeaderTitle>
                <EntityHeaderDescription className="flex items-center gap-1.5 mt-0.5">
                    <span
                        className={cn(
                            "font-mono font-medium tabular-nums text-foreground",
                            isArchived && "line-through opacity-60 text-muted-foreground"
                        )}
                    >
                        {formatMoney(availableLimit)}
                    </span>
                    <span>•</span>
                    <span>
                        {isArchived ? "Arquivado" : `Vence dia ${dueDay}`}
                    </span>
                </EntityHeaderDescription>
            </EntityHeaderContent>
        </EntityHeader>
    );
}