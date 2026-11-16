import { Calendar, MoreHorizontal, Repeat } from "lucide-react";
import { AmountSpan } from "@/components/amount-span";
import { Button } from "@/components/ui/button";
import {
    ListItem,
    ListItemActions,
    ListItemAvatar,
    ListItemContent,
    ListItemFooter,
    ListItemFooterInfo,
    ListItemFooterLeft,
    ListItemFooterRight,
    ListItemHeader,
    ListItemSubtitle,
    ListItemTitle,
} from "@/components/list-item";
import { cn } from "@/lib/utils";
import type { RecurrenceListItem as RecurrenceListItemType } from "@/modules/recurrences/models/schemas/recurrence-item.schema";
import {
    formatRecurrenceDue,
    RECURRENCE_FREQUENCY_LABELS,
} from "@/modules/recurrences/ui/themes/recurrence.themes";
import { RecurrenceAvatar } from "../recurrence-avatar";
import { RecurrenceStatusBadge } from "../recurrence-status-badge";

interface Props {
    recurrence: RecurrenceListItemType;
    className?: string;
    onOpenActions: () => void;
    onSelect?: () => void;
}

export default function RecurrenceListItem({
    recurrence,
    className,
    onOpenActions,
    onSelect,
}: Props) {
    const { name, direction, frequency, currentAmount, isActive, category } =
        recurrence;

    return (
        <ListItem
            onSelect={onSelect}
            className={cn(!isActive && "opacity-75", className)}
        >
            <ListItemHeader>
                <ListItemAvatar>
                    <RecurrenceAvatar item={recurrence} size="md" />
                </ListItemAvatar>
                <ListItemContent>
                    <ListItemTitle>
                        <span
                            className={cn(
                                "truncate font-medium text-foreground text-sm",
                                !isActive && "text-muted-foreground"
                            )}
                            title={name}
                        >
                            {name}
                        </span>
                        <RecurrenceStatusBadge
                            item={recurrence}
                            className="shrink-0"
                        />
                    </ListItemTitle>
                    <ListItemSubtitle>
                        {category?.name ?? "Sem categoria"}
                    </ListItemSubtitle>
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
                        aria-label={`Ações de ${name}`}
                    >
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </ListItemActions>
            </ListItemHeader>

            <ListItemFooter>
                <ListItemFooterLeft>
                    <ListItemFooterInfo icon={Repeat}>
                        {RECURRENCE_FREQUENCY_LABELS[frequency]}
                    </ListItemFooterInfo>
                    <ListItemFooterInfo icon={Calendar}>
                        {formatRecurrenceDue(recurrence, { withPrefix: true })}
                    </ListItemFooterInfo>
                </ListItemFooterLeft>
                <ListItemFooterRight>
                    <AmountSpan
                        amount={currentAmount}
                        isPositive={isActive && direction === "CREDIT"}
                        isNegative={isActive && direction === "DEBIT"}
                        isCancelled={!isActive}
                    />
                </ListItemFooterRight>
            </ListItemFooter>
        </ListItem>
    );
}

