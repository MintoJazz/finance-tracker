import type { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils"
import type { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface"
import { failure, success, type Result } from "@/types/result.types"
import type {
  GetObligationContractsParams,
  IObligationContractsQueries,
  ObligationContractItem,
} from "../interfaces/obligation-contracts-queries.interface"

export interface GetObligationContractsUseCaseDTO {
  session: SessionPayload
  params: GetObligationContractsParams
}

export class GetObligationContractsUseCase {
  constructor(
    private readonly accessProvider: ISpaceAccessProvider,
    private readonly queries: IObligationContractsQueries
  ) {}

  async execute({
    session,
    params,
  }: GetObligationContractsUseCaseDTO): Promise<Result<ObligationContractItem[]>> {
    try {
      const {
        success: accessSuccess,
        data: accessData,
        error,
      } = await this.accessProvider.execute(session)

      if (!accessSuccess || !accessData) {
        return failure(error ?? "Acesso negado ao contexto financeiro.")
      }

      if (!accessData.canViewBalances) {
        return failure(
          "Sem permissão para visualizar saldos e compromissos deste contexto."
        )
      }

      const items = await this.queries.getObligationContracts(
        session.contextId,
        params
      )

      return success(items)
    } catch (err) {
      console.error("[GetObligationContractsUseCase] Falha:", err)
      return failure("Não foi possível carregar a lista de compromissos.")
    }
  }
}

