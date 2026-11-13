import { IPlanningAccessProvider } from "@/modules/space/application/interfaces/planning-access-provider.interface";
import { IContextMemberRepository } from "@/modules/space/application/interfaces/context-member-repository.interface";
import { GetSpaceAccessUseCase } from "@/modules/space/application/use-cases/get-acess.use-case";
import { PrismaContextMembersRepository } from "@/modules/space/infra/repositories/context-members-prisma.repository";
import { PlanningSpaceAccessAdapter } from "@/modules/contracts/infra/adapters/planning-space-access.adapter";
import { IContractProfileQueries } from "@/modules/contracts/application/interfaces/contract-profile-queries.interface";
import { ContractProfilePrismaQueries } from "@/modules/contracts/infra/repositories/contract-profile-prisma.queries";
import { CycleEngineService } from "../../application/services/cycle-engine.service";
import { CycleDetailEngine } from "../../application/services/cycle-detail-engine.service";
import { IContractCycleProfileQueries } from "../../application/interfaces/contract-cycle-profile-queries.interface";
import { ICycleEntriesQueries } from "../../application/interfaces/cycle-entries-queries.interface";
import { GetContractCyclesUseCase } from "../../application/use-cases/get-contract-cycles.use-case";
import { GetContractCycleProfileUseCase } from "../../application/use-cases/get-contract-cycle-profile.use-case";
import { ResolveCurrentContractCycleUseCase } from "../../application/use-cases/resolve-current-contract-cycle.use-case";
import { GetCycleEntriesUseCase } from "../../application/use-cases/get-cycle-entries.use-case";
import { GetObligationCyclesUseCase } from "../../application/use-cases/get-obligation-cycles.use-case";
import { ContractCycleProfilePrismaQueries } from "@/modules/cycles/infra/repositories/contract-cycle-profile-prisma.queries";
import { CycleEntriesPrismaQueries } from "@/modules/cycles/infra/repositories/cycle-entries-prisma.queries";
import { ICycleQueries } from "../../application/interfaces/cycle-queries.interface";
import { CyclePrismaQueries } from "../repositories/cycle-prisma.queries";

export class CycleFactory {
    private static readonly memberRepository: IContextMemberRepository =
        new PrismaContextMembersRepository();

    private static readonly rawSpaceAccessUseCase = new GetSpaceAccessUseCase(
        this.memberRepository
    );
    private static readonly planningAccessProvider: IPlanningAccessProvider =
        new PlanningSpaceAccessAdapter(this.rawSpaceAccessUseCase);

    private static readonly contractProfileQueries: IContractProfileQueries =
        new ContractProfilePrismaQueries();
    private static readonly contractCycleProfileQueries: IContractCycleProfileQueries =
        new ContractCycleProfilePrismaQueries();
    private static readonly cycleEntriesQueries: ICycleEntriesQueries =
        new CycleEntriesPrismaQueries();
    private static readonly cycleQueries: ICycleQueries =
        new CyclePrismaQueries();
    private static readonly cycleEngineService = new CycleEngineService();
    private static readonly cycleDetailEngine = new CycleDetailEngine();


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

    public static readonly makeGetCycleEntriesUseCase = () =>
        new GetCycleEntriesUseCase(
            this.cycleEntriesQueries,
            this.planningAccessProvider
        );

    public static readonly makeGetObligationCyclesUseCase = () =>
        new GetObligationCyclesUseCase(
            this.contractProfileQueries,
            this.planningAccessProvider,
            this.cycleEngineService
        );
}
