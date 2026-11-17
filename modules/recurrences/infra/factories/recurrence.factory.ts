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
import { RecurrencePrismaQueries } from "../repositories/recurrence-prisma.queries";

export class RecurrenceFactory {
    private static readonly recurrenceQueries: IRecurrenceQueries =
        new RecurrencePrismaQueries();
    private static readonly cycleQueries: ICycleQueries =
        new CyclePrismaQueries(prisma);
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
}
