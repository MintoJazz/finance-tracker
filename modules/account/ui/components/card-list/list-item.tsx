import { CardSummary } from "@/modules/account/core/schemas/card.schema";
import { BalanceAvatar } from "@/components/balance-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/formatters";
import { Calendar, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    ListItem,
    ListItemHeader,
    ListItemAvatar,
    ListItemContent,
    ListItemTitle,
    ListItemActions,
    ListItemFooter,
    ListItemFooterLeft,
    ListItemFooterRight,
    ListItemFooterInfo
} from "@/components/list-item";

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
    const { name, availableLimit, dueDay, closingDay, isArchived } = card;

    return (
        <ListItem onSelect={onSelect} className={cn(isArchived && "opacity-75", className)}>
            <ListItemHeader>
                <ListItemAvatar>
                    <BalanceAvatar name={name} isArchived={isArchived} size="md" />
                </ListItemAvatar>
                <ListItemContent>
                    <ListItemTitle>
                        <span className={cn("truncate font-medium text-foreground text-sm", isArchived && "text-muted-foreground")}>
                            {name}
                        </span>
                        {isArchived && (
                            <Badge variant="outline" className="text-muted-foreground">
                                Arquivado
                            </Badge>
                        )}
                    </ListItemTitle>
                </ListItemContent>
                <ListItemActions>
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
                </ListItemActions>
            </ListItemHeader>

            <ListItemFooter>
                <ListItemFooterLeft>
                    <ListItemFooterInfo icon={Calendar}>
                        Fecha dia {closingDay}
                    </ListItemFooterInfo>
                    <ListItemFooterInfo icon={Calendar}>
                        Vence dia {dueDay}
                    </ListItemFooterInfo>
                </ListItemFooterLeft>
                <ListItemFooterRight>
                    <span className={cn("font-medium font-mono tabular-nums text-foreground", isArchived && "text-muted-foreground")}>
                        {formatMoney(availableLimit)}
                    </span>
                </ListItemFooterRight>
            </ListItemFooter>
        </ListItem>
    );
}