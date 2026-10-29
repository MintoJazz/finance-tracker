import { ContextMemberType } from "@/modules/space/models/context-member.schema";

export interface IContextMemberRepository {
    findByContextAndParty(contextId: number, partyId: number): Promise<ContextMemberType | null>;
}