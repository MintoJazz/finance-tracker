"use client";

import * as React from "react";
import { QuickActions } from "@/components/quick-actions";
import { ContractProfile } from "@/modules/contracts/models/contract-profile.schema";
import { ContractSummaryItem } from "@/modules/contracts/models/contract.schema";
import {
    CONTRACT_PROFILE_ACTIONS,
    ContractActionContext,
    ContractActionsDrawerHeader,
} from "../contract-actions-drawer";

interface ContractQuickActionsProps {
    contract: ContractProfile;
    contractActionsContext?: ContractActionContext;
    className?: string;
}

export function ContractQuickActions({
    contract,
    contractActionsContext,
    className,
}: ContractQuickActionsProps) {
    const contractSummary = React.useMemo<ContractSummaryItem>(
        () => ({
            id: contract.id,
            balanceId: contract.balanceId,
            name: contract.name,
            type: contract.type,
            value: contract.value,
            frequency: contract.frequency,
            dueDay: contract.dueDay,
            dueMonth: contract.dueMonth,
            startsAt: contract.startsAt,
            endsAt: contract.endsAt,
            includeInProjection: contract.includeInProjection,
            isArchived: contract.isArchived,
        }),
        [contract]
    );

    return (
        <QuickActions
            row={contractSummary}
            actions={CONTRACT_PROFILE_ACTIONS}
            context={contractActionsContext}
            optionsHeader={
                <ContractActionsDrawerHeader contract={contractSummary} />
            }
            className={className}
        />
    );
}

export default ContractQuickActions;
