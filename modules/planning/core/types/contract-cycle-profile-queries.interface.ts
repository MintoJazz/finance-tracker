import { ContractRawData } from "./contract-profile-queries.interface";
import { CycleWindow } from "./commitment-cycle-engine.interface";

export interface RawCycleEntryMovement {
    id: number;
    balanceId: number;
    amount: number;
    direction: "DEBIT" | "CREDIT";
    balance: {
        id: number;
        name: string;
        balanceType: string;
        agreement: {
            id: number;
            balance: {
                name: string;
            };
        } | null;
    };
}

export interface RawCycleEntry {
    id: number;
    description: string;
    type: string;
    competanceDate: Date | null;
    dueDate: Date;
    createdAt: Date;
    reversesEntryId: number | null;
    reversedBy: { id: number } | null;
    movements: RawCycleEntryMovement[];
}

export interface IContractCycleProfileQueries {
    findContractProfileData(
        contextId: number,
        identifier: { agreementId?: number; balanceId?: number },
        window: CycleWindow
    ): Promise<ContractRawData | null>;

    findCycleEntries(
        contextId: number,
        agreementBalanceId: number,
        from: Date,
        to: Date
    ): Promise<RawCycleEntry[]>;
}
