import { GetSpaceAccessUseCase } from "@/modules/space/application/use-cases/get-acess.use-case"
import type { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface"
import type { IContextMemberRepository } from "@/modules/space/application/interfaces/context-member-repository.interface"
import { PrismaContextMembersRepository } from "@/modules/space/infra/repositories/context-members-prisma.repository"
import type {
  ICategoryOptionsProvider,
  ICreditCycleOptionsProvider,
  ICustodyOptionsProvider,
  ISubcategoryOptionsProvider,
} from "../../application/interfaces/operation-options-provider.interface"
import { OperationOptionsMockService } from "../mock/operation-options.mock"
import { CategoryOptionsPrismaProvider } from "../providers/category-options-prisma.provider"
import { PrismaOperationPlanExecutor } from "../executors/operation-plan-prisma.executor"
import type { IOperationPlanExecutor } from "../../application/interfaces/operation-plan-executor.interface"
import { GetOperationOptionsUseCase } from "../../application/use-cases/get-operation-options.use-case"
import { ExecuteOperationUseCase } from "../../application/use-cases/execute-operation.use-case"

export class OperationOptionsFactory {
  private static readonly memberRepository: IContextMemberRepository =
    new PrismaContextMembersRepository()
  private static readonly spaceAccessProvider: ISpaceAccessProvider =
    new GetSpaceAccessUseCase(this.memberRepository)

  private static readonly mockService = new OperationOptionsMockService()
  private static readonly categoryOptionsProvider =
    new CategoryOptionsPrismaProvider()
  private static readonly planExecutor: IOperationPlanExecutor =
    new PrismaOperationPlanExecutor()

  public static makeCustodyOptionsProvider(): ICustodyOptionsProvider {
    return this.mockService
  }

  public static makeCreditCycleOptionsProvider(): ICreditCycleOptionsProvider {
    return this.mockService
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

  public static readonly makeGetOperationOptionsUseCase = () =>
    new GetOperationOptionsUseCase(
      this.spaceAccessProvider,
      this.makeCustodyOptionsProvider(),
      this.makeCreditCycleOptionsProvider(),
      this.makeCategoryOptionsProvider(),
      this.makeSubcategoryOptionsProvider()
    )

  public static readonly makeExecuteOperationUseCase = () =>
    new ExecuteOperationUseCase(
      this.spaceAccessProvider,
      this.makeOperationPlanExecutor()
    )
}


