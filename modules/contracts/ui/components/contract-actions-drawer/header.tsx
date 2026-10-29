import {
    EntityHeader,
    EntityHeaderMedia,
    EntityHeaderContent,
    EntityHeaderTitle,
    EntityHeaderDescription,
} from "@/components/entity-header";
import { AmountSpan } from "@/components/amount-span";
import { BalanceAvatar } from "@/components/balance-avatar";
import { ContractSummaryItem } from "@/modules/contracts/models/contract.schema";

import {
  formatContractDueDay,
  FREQUENCY_LABELS,
} from "@/modules/contracts/ui/formatters/contract-schedule.formatter";

interface ContractActionsDrawerHeaderProps {
    contract: ContractSummaryItem;
}

export function ContractActionsDrawerHeader({
    contract,
}: ContractActionsDrawerHeaderProps) {
    const { name, value, type, frequency, isArchived } = contract;
    const isPayable = type === "PAYABLE";

    const frequencyLabel = FREQUENCY_LABELS[frequency] || frequency;

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
                            <span>{formatContractDueDay(contract)}</span>
                        </>
                    )}
                </EntityHeaderDescription>
            </EntityHeaderContent>
        </EntityHeader>
    );
}
