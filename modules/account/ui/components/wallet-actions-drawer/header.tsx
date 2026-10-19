import {
    EntityHeader,
    EntityHeaderMedia,
    EntityHeaderContent,
    EntityHeaderTitle,
    EntityHeaderDescription,
} from "@/components/entity-header";
import { AmountSpan } from "@/components/amount-span";
import BalanceAvatar from "@/components/balance-avatar";
import { WalletSummary } from "@/modules/account/core/schemas/wallet.schema";

interface WalletActionsDrawerHeaderProps {
    wallet: WalletSummary;
}

export function WalletActionsDrawerHeader({
    wallet,
}: WalletActionsDrawerHeaderProps) {
    const { name, amount, isArchived } = wallet;

    return (
        <EntityHeader>
            <EntityHeaderMedia>
                <BalanceAvatar name={name} isArchived={isArchived} size="lg" />
            </EntityHeaderMedia>
            <EntityHeaderContent>
                <EntityHeaderTitle>{name}</EntityHeaderTitle>
                <EntityHeaderDescription className="flex items-center gap-1.5 mt-0.5">
                    <AmountSpan
                        amount={amount}
                        isNegative={amount < 0}
                        isPositive={amount > 0}
                        isCancelled={isArchived}
                    />
                    <span>•</span>
                    <span>{isArchived ? "Carteira arquivada" : "Carteira"}</span>
                </EntityHeaderDescription>
            </EntityHeaderContent>
        </EntityHeader>
    );
}