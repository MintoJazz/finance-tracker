export interface IBalanceLookupProvider {
    findWalletById(
        id: number,
        contextId: number
    ): Promise<{ id: number; name: string } | null>;
    findCardById?(
        id: number,
        contextId: number
    ): Promise<{ id: number; name: string } | null>;
}