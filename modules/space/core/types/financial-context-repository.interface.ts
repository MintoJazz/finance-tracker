import { UserContextOption } from "../schemas/context.schema";

export interface CreateContextWithOwnerDTO {
  name: string;
  ownerPartyId: number;
}

export interface IFinancialContextRepository {
  createContextWithOwner(data: CreateContextWithOwnerDTO): Promise<{ id: number; name: string }>;
  findDefaultByParty(partyId: number): Promise<{ contextId: number } | null>;
  findActiveContextsByParty(partyId: number): Promise<UserContextOption[]>;
}
