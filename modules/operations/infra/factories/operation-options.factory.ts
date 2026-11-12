import { GetSpaceAccessUseCase } from "@/modules/space/application/use-cases/get-acess.use-case"
import type { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface"
import type { IContextMemberRepository } from "@/modules/space/application/interfaces/context-member-repository.interface"
import { PrismaContextMembersRepository } from "@/modules/space/infra/repositories/context-members-prisma.repository"
import type {
  ICategoryOptionsProvider,
  ICustodyOptionsProvider,
  ISubcategoryOptionsProvider,
} from "../../application/interfaces/operation-options-provider.interface"
import { CustodyOptionsPrismaProvider } from "../providers/custody-options-prisma.provider"
import { CategoryOptionsPrismaProvider } from "../providers/category-options-prisma.provider"
import { PrismaOperationPlanExecutor } from "../executors/operation-plan-prisma.executor"
import type { IOperationPlanExecutor } from "../../application/interfaces/operation-plan-executor.interface"
import { GetOperationOptionsUseCase } from "../../application/use-cases/get-operation-options.use-case"
import { GetCustodyOptionsUseCase } from "../../application/use-cases/get-custody-options.use-case"
import { ExecuteOperationUseCase } from "../../application/use-cases/execute-operation.use-case"
import { GetObligationContractsUseCase } from "../../application/use-cases/get-obligation-contracts.use-case"
import { ObligationContractsPrismaQueries } from "../repositories/obligation-contracts-prisma.queries"

export class OperationOptionsFactory {
  private static readonly memberRepository: IContextMemberRepository =
    new PrismaContextMembersRepository()
  private static readonly spaceAccessProvider: ISpaceAccessProvider =
    new GetSpaceAccessUseCase(this.memberRepository)

  private static readonly custodyOptionsProvider =
    new CustodyOptionsPrismaProvider()
  private static readonly categoryOptionsProvider =
    new CategoryOptionsPrismaProvider()
  private static readonly planExecutor: IOperationPlanExecutor =
    new PrismaOperationPlanExecutor()
  private static readonly obligationContractsQueries =
    new ObligationContractsPrismaQueries()

  public static makeCustodyOptionsProvider(): ICustodyOptionsProvider {
    return this.custodyOptionsProvider
  }

  public static makeCategoryOptionsProvider(): ICategoryOptionsProvider {
    return this.categoryOptionsProvider
  }

  public static makeSubcategoryOptionsProvider(): ISubcategoryOptionsProvider {
    return this.categoryOptionsProvider
  }

  public static makeOperationPlanExecutor(): IOperationPlanExecutor {
    return this.planExecutor
  }

  public static readonly makeGetCustodyOptionsUseCase = () =>
    new GetCustodyOptionsUseCase(
      this.spaceAccessProvider,
      this.makeCustodyOptionsProvider()
    )

  public static readonly makeGetOperationOptionsUseCase = () =>
    new GetOperationOptionsUseCase(
      this.spaceAccessProvider,
      this.makeCustodyOptionsProvider(),
      this.makeCategoryOptionsProvider(),
      this.makeSubcategoryOptionsProvider()
    )

  public static readonly makeExecuteOperationUseCase = () =>
    new ExecuteOperationUseCase(
      this.spaceAccessProvider,
      this.makeOperationPlanExecutor()
    )

  public static readonly makeGetObligationContractsUseCase = () =>
    new GetObligationContractsUseCase(
      this.spaceAccessProvider,
      this.obligationContractsQueries
    )
}


