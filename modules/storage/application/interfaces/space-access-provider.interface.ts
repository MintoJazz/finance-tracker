import { Result } from "@/types/result.types";

export interface SpaceAccessProviderDTO {
    contextId: number;
    partyId: number;
}

export interface ISpaceAccessProvider {
    execute(dto: SpaceAccessProviderDTO): Promise<Result<unknown>>;
}
