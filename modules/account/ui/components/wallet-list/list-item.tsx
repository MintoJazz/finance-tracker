import { WalletSummary } from "@/modules/account/core/schemas/wallet.schema";
import { AmountSpan } from "@/components/amount-span";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/formatters";
import { Calendar, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import BalanceAvatar from "@/components/balance-avatar";
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
                                Arquivada
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
                        {lastActivityAt
                            ? `Última atividade: ${formatDate(new Date(lastActivityAt))}`
                            : "Sem atividade recente"}
                    </ListItemFooterInfo>
                </ListItemFooterLeft>
                <ListItemFooterRight>
                    <AmountSpan
                        amount={amount}
                        isNegative={amount < 0}
                        isPositive={amount > 0}
                        isCancelled={isArchived}
                    />
                </ListItemFooterRight>
            </ListItemFooter>
        </ListItem>
    );
}