export interface IContractRepository {
    archiveContract(id: number, contextId: number): Promise<void>;
    restoreContract(id: number, contextId: number): Promise<void>;
    updateContractProjection(id: number, contextId: number, includeInProjection: boolean): Promise<void>;
}
