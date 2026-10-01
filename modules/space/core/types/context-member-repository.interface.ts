import { ContextMemberType } from "../schemas/context-member.schema";

export interface IContextMemberRepository {
    findByContextAndParty(contextId: number, partyId: number): Promise<ContextMemberType | null>;
}