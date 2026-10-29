import { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import { IPlanningAccessProvider } from "@/modules/space/application/interfaces/planning-access-provider.interface";
import { IContextMemberRepository } from "@/modules/space/application/interfaces/context-member-repository.interface";
import { GetSpaceAccessUseCase } from "@/modules/space/application/use-cases/get-acess.use-case";
import { PrismaContextMembersRepository } from "@/modules/space/infra/repositories/context-members-prisma.repository";
import { CycleEngineService } from "@/modules/cycles/application/services/cycle-engine.service";
import { IAgreementDetailQueries } from "../../application/interfaces/agreement-detail-queries.interface";
import { IContractQueries } from "../../application/interfaces/contract-queries.interface";
import { IContractRepository } from "../../application/interfaces/contract-repository.interface";
import { IContractProfileQueries } from "../../application/interfaces/contract-profile-queries.interface";
import { CreateContractUseCase } from "../../application/use-cases/create-contract.use-case";
import { ArchiveContractUseCase } from "../../application/use-cases/archive-contract.use-case";
import { GetAgreementDetailUseCase } from "../../application/use-cases/get-agreement-detail.use-case";
import { GetContractProfileUseCase } from "../../application/use-cases/get-contract-profile.use-case";
import { GetContextContractsUseCase } from "../../application/use-cases/get-context-contracts.use-case";
import { RestoreContractUseCase } from "../../application/use-cases/restore-contract.use-case";
import { ToggleContractProjectionUseCase } from "../../application/use-cases/toggle-contract-projection.use-case";
import { PlanningSpaceAccessAdapter } from "../adapters/planning-space-access.adapter";
import { AgreementDetailPrismaQueries } from "@/modules/contracts/infra/repositories/agreement-detail-prisma.queries";
import { ContractPrismaQueries } from "@/modules/contracts/infra/repositories/contract-prisma.queries";
import { ContractPrismaRepository } from "@/modules/contracts/infra/repositories/contract-prisma.repository";
import { ContractProfilePrismaQueries } from "@/modules/contracts/infra/repositories/contract-profile-prisma.queries";

export class ContractFactory {
    private static readonly contractQueries: IContractQueries =
        new ContractPrismaQueries();
    private static readonly contractRepository: IContractRepository =
        new ContractPrismaRepository();
    private static readonly memberRepository: IContextMemberRepository =
        new PrismaContextMembersRepository();

    private static readonly rawSpaceAccessUseCase = new GetSpaceAccessUseCase(
        this.memberRepository
    );
    private static readonly spaceAccessProvider: ISpaceAccessProvider =
        this.rawSpaceAccessUseCase;
    private static readonly planningAccessProvider: IPlanningAccessProvider =
        new PlanningSpaceAccessAdapter(this.rawSpaceAccessUseCase);

    private static readonly agreementDetailQueries: IAgreementDetailQueries =
        new AgreementDetailPrismaQueries();
    private static readonly contractProfileQueries: IContractProfileQueries =
        new ContractProfilePrismaQueries();
    private static readonly cycleEngineService = new CycleEngineService();

    public static readonly makeCreateContractUseCase = () =>
        new CreateContractUseCase(
            this.contractRepository,
            this.spaceAccessProvider
        );

    public static readonly makeGetContextContractsUseCase = () =>
        new GetContextContractsUseCase(
            this.contractQueries,
            this.spaceAccessProvider
        );

    public static readonly makeToggleContractProjectionUseCase = () =>
        new ToggleContractProjectionUseCase(
            this.contractRepository,
            this.spaceAccessProvider
        );

    public static readonly makeArchiveContractUseCase = () =>
        new ArchiveContractUseCase(
            this.contractRepository,
            this.spaceAccessProvider
        );

    public static readonly makeRestoreContractUseCase = () =>
        new RestoreContractUseCase(
            this.contractRepository,
            this.spaceAccessProvider
        );

    public static readonly makeGetContractProfileUseCase = () =>
        new GetContractProfileUseCase(
            this.contractProfileQueries,
            this.planningAccessProvider,
            this.cycleEngineService
        );

    public static readonly makeGetAgreementDetailUseCase = () =>
        new GetAgreementDetailUseCase(
            this.agreementDetailQueries,
            this.planningAccessProvider,
            this.cycleEngineService
        );
}
