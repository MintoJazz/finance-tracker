import { IContextMemberRepository } from "@/modules/space/core/types/context-member-repository.interface";
import { PrismaContextMembersRepository } from "../prisma/context-members/prisma.repository";
import { GetSpaceAccessUseCase } from "@/modules/space/core/use-case/get-acess.use-case";

export class SpaceFactory {
    private static readonly contextMemberRepository: IContextMemberRepository = new PrismaContextMembersRepository()

    public static readonly makeGetAccess = () => new GetSpaceAccessUseCase(this.contextMemberRepository)
}