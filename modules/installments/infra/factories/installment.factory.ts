import { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import { IContextMemberRepository } from "@/modules/space/application/interfaces/context-member-repository.interface";
import { GetSpaceAccessUseCase } from "@/modules/space/application/use-cases/get-acess.use-case";
import { PrismaContextMembersRepository } from "@/modules/space/infra/repositories/context-members-prisma.repository";
import { IInstallmentQueries } from "../../application/interfaces/installment-queries.interface";
import { GetContextInstallmentsUseCase } from "../../application/use-cases/get-context-installments.use-case";
import { InstallmentPrismaQueries } from "../repositories/installment-prisma.queries";

export class InstallmentFactory {
    private static readonly installmentQueries: IInstallmentQueries =
        new InstallmentPrismaQueries();
    private static readonly memberRepository: IContextMemberRepository =
        new PrismaContextMembersRepository();
    private static readonly spaceAccessProvider: ISpaceAccessProvider =
        new GetSpaceAccessUseCase(this.memberRepository);

    public static readonly makeGetContextInstallmentsUseCase = () =>
        new GetContextInstallmentsUseCase(
            this.installmentQueries,
            this.spaceAccessProvider
        );
}
