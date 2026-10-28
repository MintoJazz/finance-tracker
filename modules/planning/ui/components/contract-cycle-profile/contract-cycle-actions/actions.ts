import {
    ContractCycleItem,
    ContractCycleProfile,
} from "../../../../core/schemas/contract-cycle.schema";

export {
    CONTRACT_CYCLE_ACTIONS,
    ContractCycleActionsDrawer,
    ContractCycleActionsDrawerHeader,
} from "../../contract-profile/contract-cycle-actions";
export type { ContractCycleActionContext } from "../../contract-profile/contract-cycle-actions";

export function cycleProfileToItem(profile: ContractCycleProfile): ContractCycleItem {
    return {
        cycleKey: `${profile.contractId}-${profile.range.from}-${profile.range.to}`,
        contractId: profile.contractId,
        label: profile.title,
        from: profile.range.from,
        to: profile.range.to,
        dueDate: new Date(profile.dueDate),
        status: profile.status,
        totalAmount: profile.expectedAmount,
        paidAmount: profile.paidAmount,
        remainingAmount: profile.openAmount,
        movementsCount: 0,
        settlementDate: null,
    };
}
