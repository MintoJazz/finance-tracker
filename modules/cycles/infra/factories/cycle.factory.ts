import { prisma } from "@/lib/prisma";
import { GetSpaceAccessUseCase } from "@/modules/space/application/use-cases/get-acess.use-case";
import { IContextMemberRepository } from "@/modules/space/application/interfaces/context-member-repository.interface";
import { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import { PrismaContextMembersRepository } from "@/modules/space/infra/repositories/context-members-prisma.repository";
import { ICycleQueries } from "../../application/interfaces/cycle-queries.interface";
import { CyclePrismaQueries } from "../repositories/cycle-prisma.queries";
import { GetCycleDetailUseCase } from "../../application/use-cases/get-cycle-detail.usecase";
import { GetCardInvoiceOptionsUseCase } from "../../application/use-cases/get-card-invoice-options.usecase";

export class CycleFactory {
    private static readonly cycleQueries: ICycleQueries =
        new CyclePrismaQueries(prisma);
    private static readonly memberRepository: IContextMemberRepository =
        new PrismaContextMembersRepository();
    private static readonly spaceAccessProvider: ISpaceAccessProvider =
        new GetSpaceAccessUseCase(this.memberRepository);

    public static readonly makeGetCycleDetailUseCase = () =>
        new GetCycleDetailUseCase(this.cycleQueries, this.spaceAccessProvider);

    public static readonly makeGetCardInvoiceOptionsUseCase = () =>
        new GetCardInvoiceOptionsUseCase(
            this.cycleQueries,
            this.spaceAccessProvider
        );
}