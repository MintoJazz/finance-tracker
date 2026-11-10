import type { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils"
import type { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface"
import { failure, success, type Result } from "@/types/result.types"
import type { ICustodyOptionsProvider } from "../interfaces/operation-options-provider.interface"
import type { CustodyOption } from "../../models/operation-options.schema"

export interface GetCustodyOptionsUseCaseDTO {
  session: SessionPayload
}

export class GetCustodyOptionsUseCase {
  constructor(
    private readonly getSpaceAccess: ISpaceAccessProvider,
    private readonly custodyProvider: ICustodyOptionsProvider
  ) {}

  async execute({
    session,
  }: GetCustodyOptionsUseCaseDTO): Promise<Result<CustodyOption[]>> {
    try {
      const { success: accessSuccess, data, error } =
        await this.getSpaceAccess.execute(session)

      if (!accessSuccess) {
        return failure(error ?? "Acesso negado ao contexto financeiro")
      }

      if (!data.canViewBalances) {
        return failure(
          "Sem permissão para visualizar os meios de pagamento deste contexto!"
        )
      }

      const custodies = await this.custodyProvider.listCustodyOptions(
        session.contextId
      )

      return success(custodies)
    } catch (err) {
      console.error("[GetCustodyOptionsUseCase] Erro inesperado:", err)
      return failure(
        "Ocorreu um erro interno ao carregar os meios de pagamento."
      )
    }
  }
}

