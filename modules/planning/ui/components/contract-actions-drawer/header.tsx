import {
    EntityHeader,
    EntityHeaderMedia,
    EntityHeaderContent,
    EntityHeaderTitle,
    EntityHeaderDescription,
} from "@/components/entity-header";
import { AmountSpan } from "@/components/amount-span";
import { BalanceAvatar } from "@/components/balance-avatar";
import { ContractSummaryItem } from "../../../core/schemas/contract.schema";

interface ContractActionsDrawerHeaderProps {
    contract: ContractSummaryItem;
}

export function ContractActionsDrawerHeader({
    contract,
}: ContractActionsDrawerHeaderProps) {
    const { name, value, type, frequency, dueDay, isArchived } = contract;
    const isPayable = type === "PAYABLE";

    const frequencyLabel =
        frequency === "MONTHLY"
            ? "Mensal"
            : frequency === "WEEKLY"
            ? "Semanal"
            : "Anual";

    return (
        <EntityHeader>
            <EntityHeaderMedia>
                <BalanceAvatar name={name} isArchived={isArchived} size="lg" />
            </EntityHeaderMedia>
            <EntityHeaderContent>
                <EntityHeaderTitle>{name}</EntityHeaderTitle>
                <EntityHeaderDescription className="flex items-center gap-1.5 mt-0.5">
                    <AmountSpan
                        amount={value}
                        isNegative={isPayable}
                        isPositive={!isPayable}
                        isCancelled={isArchived}
                    />
                    <span>•</span>
                    {isArchived ? (
                        <span>Contrato arquivado</span>
                    ) : (
                        <>
                            <span>{frequencyLabel}</span>
                            <span>•</span>
                            <span>Dia {dueDay}</span>
                        </>
                    )}
                </EntityHeaderDescription>
            </EntityHeaderContent>
        </EntityHeader>
    );
}
