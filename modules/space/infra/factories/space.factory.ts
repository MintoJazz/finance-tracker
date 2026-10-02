import { IContextMemberRepository } from "@/modules/space/core/types/context-member-repository.interface";
import { IFinancialContextRepository } from "@/modules/space/core/types/financial-context-repository.interface";
import { PrismaContextMembersRepository } from "../repositories/context-members-prisma.repository";
import { PrismaFinancialContextRepository } from "../repositories/financial-context-prisma.repository";
import { GetSpaceAccessUseCase } from "@/modules/space/core/use-case/get-acess.use-case";
import { GetUserContextsUseCase } from "@/modules/space/core/use-case/get-user-contexts.use-case";
import { SwitchContextUseCase } from "@/modules/space/core/use-case/switch-context.use-case";

export class SpaceFactory {
    private static readonly contextMemberRepository: IContextMemberRepository = new PrismaContextMembersRepository();
    private static readonly financialContextRepository: IFinancialContextRepository = new PrismaFinancialContextRepository();

    public static readonly makeGetAccess = () => new GetSpaceAccessUseCase(this.contextMemberRepository);
    public static readonly makeGetUserContexts = () => new GetUserContextsUseCase(this.financialContextRepository);
    public static readonly makeSwitchContext = () => new SwitchContextUseCase(this.contextMemberRepository);
}