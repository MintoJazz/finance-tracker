import { BalanceAvatar } from "@/components/balance-avatar";
import {
    EntityHeader,
    EntityHeaderContent,
    EntityHeaderDescription,
    EntityHeaderMedia,
    EntityHeaderTitle,
} from "@/components/entity-header";
import { formatDate, formatMoney } from "@/lib/formatters";
import { CommitmentCycleItem } from "@/modules/planning/core/schemas/commitment-cycle.schema";

interface Props {
    item: CommitmentCycleItem;
}

export function CommitmentCycleActionsDrawerHeader({ item }: Props) {
    const displayAmount =
        item.status === "PAID" ? item.totalAmount : item.remainingAmount;

    return (
        <EntityHeader>
            <EntityHeaderMedia>
                <BalanceAvatar name={item.balanceName} size="lg" />
            </EntityHeaderMedia>
            <EntityHeaderContent>
                <EntityHeaderTitle>{item.balanceName}</EntityHeaderTitle>
                <EntityHeaderDescription className="font-mono">
                    {formatMoney(displayAmount)}
                    {" • "}
                    <span className="font-sans">
                        Vence {formatDate(item.dueDate)}
                    </span>
                </EntityHeaderDescription>
            </EntityHeaderContent>
        </EntityHeader>
    );
}