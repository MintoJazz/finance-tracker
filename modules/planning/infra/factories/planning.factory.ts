import { ISpaceAccessProvider } from "@/modules/account/core/types/space-access-provider.interface";
import { IContextMemberRepository } from "@/modules/space/core/types/context-member-repository.interface";
import { GetSpaceAccessUseCase } from "@/modules/space/core/use-case/get-acess.use-case";
import { PrismaContextMembersRepository } from "@/modules/space/infra/repositories/context-members-prisma.repository";
import { CycleEngineService } from "../../core/services/cycle-engine.service";
import { IAgreementDetailQueries } from "../../core/types/agreement-detail-queries.interface";
import { IContractQueries } from "../../core/types/contract-queries.interface";
import { IContractRepository } from "../../core/types/contract-repository.interface";
import { ICycleEntriesQueries } from "../../core/types/cycle-entries-queries.interface";
import { IContractProfileQueries } from "../../core/types/contract-profile-queries.interface";
import { IContractCycleProfileQueries } from "../../core/types/contract-cycle-profile-queries.interface";
import { IPlanningAccessProvider } from "../../core/types/space-access-provider.interface";
import { CreateContractUseCase } from "../../core/use-cases/create-contract.use-case";
import { ArchiveContractUseCase } from "../../core/use-cases/archive-contract.use-case";
import { GetAgreementDetailUseCase } from "../../core/use-cases/get-agreement-detail.use-case";
import { GetContractCyclesUseCase } from "../../core/use-cases/get-contract-cycles.use-case";
import { GetContractProfileUseCase } from "../../core/use-cases/get-contract-profile.use-case";
import { GetContractCycleProfileUseCase } from "../../core/use-cases/get-contract-cycle-profile.use-case";
import { ResolveCurrentContractCycleUseCase } from "../../core/use-cases/resolve-current-contract-cycle.use-case";
import { GetContextContractsUseCase } from "../../core/use-cases/get-context-contracts.use-case";
import { GetCycleEntriesUseCase } from "../../core/use-cases/get-cycle-entries.use-case";
import { RestoreContractUseCase } from "../../core/use-cases/restore-contract.use-case";
import { ToggleContractProjectionUseCase } from "../../core/use-cases/toggle-contract-projection.use-case";
import { PlanningSpaceAccessAdapter } from "../adapters/planning-space-access.adapter";
import { AgreementDetailPrismaQueries } from "../repositories/agreement-detail-prisma.queries";
import { ContractPrismaQueries } from "../repositories/contract-prisma.queries";
import { ContractPrismaRepository } from "../repositories/contract-prisma.repository";
import { ContractProfilePrismaQueries } from "../repositories/contract-profile-prisma.queries";
import { ContractCycleProfilePrismaQueries } from "../repositories/contract-cycle-profile-prisma.queries";
import { CycleEntriesPrismaQueries } from "../repositories/cycle-entries-prisma.queries";

export class PlanningFactory {
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
    private static readonly contractCycleProfileQueries: IContractCycleProfileQueries =
        new ContractCycleProfilePrismaQueries();
    private static readonly cycleEntriesQueries: ICycleEntriesQueries =
        new CycleEntriesPrismaQueries();
    private static readonly cycleEngineService = new CycleEngineService();

    // Contracts
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

    // Contract Profile & Cycles
    public static readonly makeGetContractProfileUseCase = () =>
        new GetContractProfileUseCase(
            this.contractProfileQueries,
            this.planningAccessProvider,
            this.cycleEngineService
        );

    public static readonly makeGetContractCyclesUseCase = () =>
        new GetContractCyclesUseCase(
            this.contractProfileQueries,
            this.planningAccessProvider,
            this.cycleEngineService
        );

    public static readonly makeGetContractCycleProfileUseCase = () =>
        new GetContractCycleProfileUseCase(
            this.contractCycleProfileQueries,
            this.planningAccessProvider,
            this.cycleEngineService
        );

    public static readonly makeResolveCurrentContractCycleUseCase = () =>
        new ResolveCurrentContractCycleUseCase(
            this.contractCycleProfileQueries,
            this.planningAccessProvider,
            this.cycleEngineService
        );

    // Agreement Detail & Drill-down
    public static readonly makeGetAgreementDetailUseCase = () =>
        new GetAgreementDetailUseCase(
            this.agreementDetailQueries,
            this.planningAccessProvider,
            this.cycleEngineService
        );

    public static readonly makeGetCycleEntriesUseCase = () =>
        new GetCycleEntriesUseCase(
            this.cycleEntriesQueries,
            this.planningAccessProvider
        );
}
