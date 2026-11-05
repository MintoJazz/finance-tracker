import { ContractBalanceTypeEnum, ContractFrequencyEnum, ContractTypeEnum } from "../../models/contract.schema";

export interface CreateContractRepositoryDTO {
    contextId: number;
    name: string;
    type: ContractTypeEnum;
    value: number;
    frequency: ContractFrequencyEnum;
    validity: {
        from: Date;
        to?: Date;
    };
    hasCustomClosingDay: boolean;
    schedule: {
        dueDay: number;
        closingDay?: number | null;
        dueMonth?: number | null;
        closingMonth?: number | null;
    };
    includeInProjection: boolean;
}

export interface CreatedContractResult {
    id: number;
    balanceId: number;
    name: string;
}

export interface ContractRuleData {
    id: number;
    effectiveFrom: Date;
    frequency: ContractFrequencyEnum;
    interval: number;
    dueDay: number;
    closingDay: number | null;
}

export interface ContractAmountEntryData {
    id: number;
    amount: number;
    effectiveAt: Date;
    reason: string | null;
}

export interface ContractAdjustmentData {
    id: number;
    balanceId: number;
    name: string;
    balanceType: ContractBalanceTypeEnum;
    startsAt: Date;
    endsAt: Date | null;
    includeInProjection: boolean;
    isArchived: boolean;
    rules: ContractRuleData[];
    amountEntries: ContractAmountEntryData[];
}

export interface AdjustContractLimitsRepositoryDTO {
    amount: number;
    effectiveAt: Date;
    reason?: string | null;
}

export interface AdjustContractScheduleRepositoryDTO {
    effectiveFrom: Date;
    frequency: "ONCE" | "WEEKLY" | "MONTHLY" | "YEARLY";
    interval?: number;
    dueDay: number;
    closingDay: number | null;
}

export interface IContractRepository {
    createContract(data: CreateContractRepositoryDTO): Promise<CreatedContractResult>;
    archiveContract(id: number, contextId: number): Promise<void>;
    restoreContract(id: number, contextId: number): Promise<void>;
    updateContractProjection(id: number, contextId: number, includeInProjection: boolean): Promise<void>;
    renameContract(id: number, contextId: number, name: string): Promise<void>;
    findContractForAdjustment(id: number, contextId: number): Promise<ContractAdjustmentData | null>;
    adjustContractLimits(id: number, contextId: number, data: AdjustContractLimitsRepositoryDTO): Promise<void>;
    adjustContractSchedule(id: number, contextId: number, data: AdjustContractScheduleRepositoryDTO): Promise<void>;
}
