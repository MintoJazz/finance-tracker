export interface CreateContractRepositoryDTO {
    contextId: number;
    name: string;
    type: "PAYABLE" | "RECEIVABLE";
    value: number;
    frequency: "WEEKLY" | "MONTHLY" | "YEARLY";
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

export interface IContractRepository {
    createContract(data: CreateContractRepositoryDTO): Promise<CreatedContractResult>;
    archiveContract(id: number, contextId: number): Promise<void>;
    restoreContract(id: number, contextId: number): Promise<void>;
    updateContractProjection(id: number, contextId: number, includeInProjection: boolean): Promise<void>;
}
