import type { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils"
import type { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface"
import { failure, success, type Result } from "@/types/result.types"
import type {
  ICategoryOptionsProvider,
  ICreditCycleOptionsProvider,
  ICustodyOptionsProvider,
  ISubcategoryOptionsProvider,
} from "../interfaces/operation-options-provider.interface"
import type { OperationOptions } from "../../models/operation-options.schema"

export interface GetOperationOptionsUseCaseDTO {
  session: SessionPayload
}

export class GetOperationOptionsUseCase {
  constructor(
    private readonly getSpaceAccess: ISpaceAccessProvider,
    private readonly custodyProvider: ICustodyOptionsProvider,
    private readonly creditCycleProvider: ICreditCycleOptionsProvider,
    private readonly categoryProvider: ICategoryOptionsProvider,
    private readonly subcategoryProvider: ISubcategoryOptionsProvider
  ) {}

  async execute({
    session,
  }: GetOperationOptionsUseCaseDTO): Promise<Result<OperationOptions>> {
    try {
      const { success: accessSuccess, data, error } =
        await this.getSpaceAccess.execute(session)

      if (!accessSuccess) {
        return failure(error ?? "Acesso negado ao contexto financeiro")
      }

      if (!data.canViewBalances) {
        return failure(
          "Sem permissão para visualizar as opções financeiras deste contexto!"
        )
      }

      const [custodies, creditCycles, categories, subcategories] =
        await Promise.all([
          this.custodyProvider.listCustodyOptions(session.contextId),
          this.creditCycleProvider.listCreditCycleOptions(session.contextId),
          this.categoryProvider.listCategoryOptions(session.contextId),
          this.subcategoryProvider.listSubcategoryOptions(session.contextId),
        ])

      return success({
        custodies,
        creditCycles,
        categories,
        subcategories,
      })
    } catch (err) {
      console.error("[GetOperationOptionsUseCase] Erro inesperado:", err)
      return failure("Ocorreu um erro interno ao carregar as opções da operação.")
    }
  }
}

