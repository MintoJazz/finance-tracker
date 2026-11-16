import {
    EntityHeader,
    EntityHeaderContent,
    EntityHeaderDescription,
    EntityHeaderMedia,
    EntityHeaderTitle,
} from "@/components/entity-header";
import { AmountSpan } from "@/components/amount-span";
import type { RecurrenceListItem } from "@/modules/recurrences/models/schemas/recurrence-item.schema";
import {
    formatRecurrenceDue,
    RECURRENCE_FREQUENCY_LABELS,
} from "@/modules/recurrences/ui/themes/recurrence.themes";
import { RecurrenceAvatar } from "../recurrence-avatar";

interface RecurrenceActionsDrawerHeaderProps {
    recurrence: RecurrenceListItem;
}

export function RecurrenceActionsDrawerHeader({
    recurrence,
}: RecurrenceActionsDrawerHeaderProps) {
    const { name, direction, currentAmount, frequency, isActive } = recurrence;

    return (
        <EntityHeader>
            <EntityHeaderMedia>
                <RecurrenceAvatar item={recurrence} size="lg" />
            </EntityHeaderMedia>
            <EntityHeaderContent>
                <EntityHeaderTitle>{name}</EntityHeaderTitle>
                <EntityHeaderDescription className="flex items-center gap-1.5 mt-0.5">
                    <AmountSpan
                        amount={currentAmount}
                        isPositive={isActive && direction === "CREDIT"}
                        isNegative={isActive && direction === "DEBIT"}
                        isCancelled={!isActive}
                    />
                    <span>•</span>
                    <span>
                        {RECURRENCE_FREQUENCY_LABELS[frequency]} •{" "}
                        {formatRecurrenceDue(recurrence)}
                    </span>
                </EntityHeaderDescription>
            </EntityHeaderContent>
        </EntityHeader>
    );
}

