import { IContextMemberRepository } from "@/modules/space/application/interfaces/context-member-repository.interface";
import { IFinancialContextRepository } from "@/modules/space/application/interfaces/financial-context-repository.interface";
import { PrismaContextMembersRepository } from "../repositories/context-members-prisma.repository";
import { PrismaFinancialContextRepository } from "../repositories/financial-context-prisma.repository";
import { GetSpaceAccessUseCase } from "@/modules/space/application/use-cases/get-acess.use-case";
import { GetUserContextsUseCase } from "@/modules/space/application/use-cases/get-user-contexts.use-case";
import { SwitchContextUseCase } from "@/modules/space/application/use-cases/switch-context.use-case";

export class SpaceFactory {
    private static readonly contextMemberRepository: IContextMemberRepository = new PrismaContextMembersRepository();
    private static readonly financialContextRepository: IFinancialContextRepository = new PrismaFinancialContextRepository();

    public static readonly makeGetAccess = () => new GetSpaceAccessUseCase(this.contextMemberRepository);
    public static readonly makeGetUserContexts = () => new GetUserContextsUseCase(this.financialContextRepository);
    public static readonly makeSwitchContext = () => new SwitchContextUseCase(this.contextMemberRepository);
}