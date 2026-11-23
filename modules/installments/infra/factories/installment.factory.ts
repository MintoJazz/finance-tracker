import { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import { IContextMemberRepository } from "@/modules/space/application/interfaces/context-member-repository.interface";
import { GetSpaceAccessUseCase } from "@/modules/space/application/use-cases/get-acess.use-case";
import { PrismaContextMembersRepository } from "@/modules/space/infra/repositories/context-members-prisma.repository";
import { IInstallmentQueries } from "../../application/interfaces/installment-queries.interface";
import { CategoryPrismaQueries } from "@/modules/categories/infra/repositories/category-prisma.queries";
import { ICategoryQueries } from "@/modules/categories/application/interfaces/category-queries.interface";
import { IInstallmentUnitOfWork } from "../../application/interfaces/installment-uow.interface";
import { CreateInstallmentUseCase } from "../../application/use-cases/create-installment.use-case";
import { GetContextInstallmentsUseCase } from "../../application/use-cases/get-context-installments.use-case";
import { GetInstallmentFormOptionsUseCase } from "../../application/use-cases/get-installment-form-options.use-case";
import { InstallmentPrismaQueries } from "../repositories/installment-prisma.queries";
import { InstallmentPrismaUnitOfWork } from "../uow/installment-prisma.uow";

export class InstallmentFactory {
    private static readonly installmentQueries: IInstallmentQueries =
        new InstallmentPrismaQueries();
    private static readonly categoryQueries: ICategoryQueries =
        new CategoryPrismaQueries();
    private static readonly installmentUow: IInstallmentUnitOfWork =
        new InstallmentPrismaUnitOfWork();
    private static readonly memberRepository: IContextMemberRepository =
        new PrismaContextMembersRepository();
    private static readonly spaceAccessProvider: ISpaceAccessProvider =
        new GetSpaceAccessUseCase(this.memberRepository);

    public static readonly makeGetContextInstallmentsUseCase = () =>
        new GetContextInstallmentsUseCase(
            this.installmentQueries,
            this.spaceAccessProvider
        );

    public static readonly makeCreateInstallmentUseCase = () =>
        new CreateInstallmentUseCase(this.installmentUow, this.spaceAccessProvider);

    public static readonly makeGetInstallmentFormOptionsUseCase = () =>
        new GetInstallmentFormOptionsUseCase(
            this.categoryQueries,
            this.installmentQueries,
            this.spaceAccessProvider
        );
}
