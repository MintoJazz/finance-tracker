import { GetSpaceAccessUseCase } from "@/modules/space/application/use-cases/get-acess.use-case";
import type { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import type { IContextMemberRepository } from "@/modules/space/application/interfaces/context-member-repository.interface";
import { PrismaContextMembersRepository } from "@/modules/space/infra/repositories/context-members-prisma.repository";
import type { IAgreementAdjustmentRepository } from "../../application/interfaces/agreement-adjustment-repository.interface";
import { AdjustAgreementAmountUseCase } from "../../application/use-cases/adjust-agreement-amount.use-case";
import { AdjustAgreementDeadlinesUseCase } from "../../application/use-cases/adjust-agreement-deadlines.use-case";
import { AgreementAdjustmentPrismaRepository } from "../repositories/agreement-adjustment-prisma.repository";

export class AgreementFactory {
    private static readonly adjustmentRepository: IAgreementAdjustmentRepository =
        new AgreementAdjustmentPrismaRepository();
    private static readonly memberRepository: IContextMemberRepository =
        new PrismaContextMembersRepository();

    private static readonly spaceAccessProvider: ISpaceAccessProvider =
        new GetSpaceAccessUseCase(this.memberRepository);

    public static readonly makeAdjustAgreementAmountUseCase = () =>
        new AdjustAgreementAmountUseCase(
            this.adjustmentRepository,
            this.spaceAccessProvider
        );

    public static readonly makeAdjustAgreementDeadlinesUseCase = () =>
        new AdjustAgreementDeadlinesUseCase(
            this.adjustmentRepository,
            this.spaceAccessProvider
        );
}
