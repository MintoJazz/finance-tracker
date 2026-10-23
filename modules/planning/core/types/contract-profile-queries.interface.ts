import {
    AgreementCycleSourceData,
    CycleWindow,
} from "./commitment-cycle-engine.interface";

export interface RawContractAgreement {
    id: number;
    balanceId: number;
    includeInProjection: boolean;
    startsAt: Date;
    endsAt: Date | null;
    createdAt: Date;
    balance: {
        id: number;
        name: string;
        balanceType: string;
        removedAt: Date | null;
    };
    rules: {
        id: number;
        agreementId: number;
        effectiveFrom: Date;
        frequency: string;
        interval: number;
        closingDay: number | null;
        dueDay: number;
    }[];
    amountEntries: {
        id: number;
        amount: number;
        effectiveAt: Date;
        reason: string | null;
        createdAt: Date;
    }[];
}

export interface ContractRawData {
    agreement: RawContractAgreement;
    cycleSource: AgreementCycleSourceData;
}

export interface IContractProfileQueries {
    findContractProfileData(
        contextId: number,
        identifier: { agreementId?: number; balanceId?: number },
        window: CycleWindow
    ): Promise<ContractRawData | null>;
}
