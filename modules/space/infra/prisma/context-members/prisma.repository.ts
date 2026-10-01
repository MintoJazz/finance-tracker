import { IContextMemberRepository } from "@/modules/space/core/types/context-member-repository.interface";
import { prisma } from "@/lib/prisma";
import { ContextMemberType } from "@/modules/space/core/schemas/context-member.schema";

export class PrismaContextMembersRepository implements IContextMemberRepository {

    async findByContextAndParty(contextId: number, partyId: number): Promise<ContextMemberType | null> {
        const member = await prisma.contextMember.findFirst({
            where: {
                contextId,
                partyId,
            },
        })
        return member as ContextMemberType | null
    }
}