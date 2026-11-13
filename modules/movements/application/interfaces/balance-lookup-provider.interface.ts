export interface IBalanceLookupProvider {
    findWalletById(
        id: number,
        contextId: number
    ): Promise<{ id: number; name: string } | null>;
    findCardById?(
        id: number,
        contextId: number
    ): Promise<{ id: number; name: string } | null>;
    findContractById?(
        id: number,
        contextId: number
    ): Promise<{ id: number; name: string; isOnce: boolean } | null>;
}