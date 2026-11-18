import { prisma } from "@/lib/prisma";
import { GetSpaceAccessUseCase } from "@/modules/space/application/use-cases/get-acess.use-case";
import { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import { IContextMemberRepository } from "@/modules/space/application/interfaces/context-member-repository.interface";
import { PrismaContextMembersRepository } from "@/modules/space/infra/repositories/context-members-prisma.repository";
import { ICycleQueries } from "@/modules/cycles/application/interfaces/cycle-queries.interface";
import { CyclePrismaQueries } from "@/modules/cycles/infra/repositories/cycle-prisma.queries";
import { IRecurrenceQueries } from "../../application/interfaces/recurrence-queries.interface";
import { GetContextRecurrencesUseCase } from "../../application/use-cases/get-context-recurrences.use-case";
import { GetRecurrenceProfileUseCase } from "../../application/use-cases/get-recurrence-profile.use-case";
import { GetRecurrenceCyclesUseCase } from "../../application/use-cases/get-recurrence-cycles.use-case";
import { CategoryPrismaQueries } from "@/modules/categories/infra/repositories/category-prisma.queries";
import { ICategoryQueries } from "@/modules/categories/application/interfaces/category-queries.interface";
import { GetRecurrenceFormOptionsUseCase } from "../../application/use-cases/get-recurrence-form-options.use-case";
import { CreateRecurrenceUseCase } from "../../application/use-cases/create-recurrence.use-case";
import { UpdateRecurrenceUseCase } from "../../application/use-cases/update-recurrence.use-case";
import { ArchiveRecurrenceUseCase } from "../../application/use-cases/archive-recurrence.use-case";
import { SetRecurrenceActiveUseCase } from "../../application/use-cases/set-recurrence-active.use-case";
import { IRecurrenceRepository } from "../../application/interfaces/recurrence-repository.interface";
import { RecurrencePrismaRepository } from "../repositories/recurrence-prisma.repository";
import { IRecurrenceUnitOfWork } from "../../application/interfaces/recurrence-uow.interface";
import { RecurrencePrismaQueries } from "../repositories/recurrence-prisma.queries";
import { RecurrencePrismaUnitOfWork } from "../uow/recurrence-prisma.uow";

export class RecurrenceFactory {
    private static readonly recurrenceQueries: IRecurrenceQueries =
        new RecurrencePrismaQueries();
    private static readonly cycleQueries: ICycleQueries =
        new CyclePrismaQueries(prisma);
    private static readonly categoryQueries: ICategoryQueries =
        new CategoryPrismaQueries();
    private static readonly recurrenceRepository: IRecurrenceRepository =
        new RecurrencePrismaRepository();
    private static readonly recurrenceUow: IRecurrenceUnitOfWork =
        new RecurrencePrismaUnitOfWork();
    private static readonly memberRepository: IContextMemberRepository =
        new PrismaContextMembersRepository();

    private static readonly spaceAccessProvider: ISpaceAccessProvider =
        new GetSpaceAccessUseCase(this.memberRepository);

    public static readonly makeGetContextRecurrencesUseCase = () =>
        new GetContextRecurrencesUseCase(
            this.recurrenceQueries,
            this.spaceAccessProvider
        );

    public static readonly makeGetRecurrenceProfileUseCase = () =>
        new GetRecurrenceProfileUseCase(
            this.recurrenceQueries,
            this.spaceAccessProvider
        );

    public static readonly makeGetRecurrenceCyclesUseCase = () =>
        new GetRecurrenceCyclesUseCase(
            this.makeGetRecurrenceProfileUseCase(),
            this.cycleQueries,
            this.spaceAccessProvider
        );

    public static readonly makeCreateRecurrenceUseCase = () =>
        new CreateRecurrenceUseCase(
            this.recurrenceUow,
            this.spaceAccessProvider
        );

    public static readonly makeUpdateRecurrenceUseCase = () =>
        new UpdateRecurrenceUseCase(
            this.recurrenceUow,
            this.spaceAccessProvider
        );

    public static readonly makeGetRecurrenceFormOptionsUseCase = () =>
        new GetRecurrenceFormOptionsUseCase(
            this.categoryQueries,
            this.spaceAccessProvider
        );

    public static readonly makeArchiveRecurrenceUseCase = () =>
        new ArchiveRecurrenceUseCase(
            this.recurrenceRepository,
            this.spaceAccessProvider
        );

    public static readonly makeSetRecurrenceActiveUseCase = () =>
        new SetRecurrenceActiveUseCase(
            this.recurrenceRepository,
            this.spaceAccessProvider
        );
}
