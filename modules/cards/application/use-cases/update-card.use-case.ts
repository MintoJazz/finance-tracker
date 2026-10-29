import { UpdateCardInput } from "../../models/card.schema"
import { ICardRepository } from "../interfaces/card-repository.interface"
import { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface"
import { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils"
import { failure, success } from "@/types/result.types"

export interface UpdateCardUseCaseDTO {
  session: SessionPayload
  data: UpdateCardInput
}

export class UpdateCardUseCase {
  constructor(
    private readonly cardRepository: ICardRepository,
    private readonly getSpaceAccess: ISpaceAccessProvider
  ) {}

  async execute({ session, data }: UpdateCardUseCaseDTO) {
    try {
      const {
        success: accessSuccess,
        data: accessData,
        error,
      } = await this.getSpaceAccess.execute(session)

      if (!accessSuccess) {
        console.warn(
          `[UpdateCardUseCase] Falha de acesso ao espaço para partyId=${session.partyId}, contextId=${session.contextId}:`,
          error
        )
        return failure(error!)
      }

      const { canManageBalances } = accessData
      if (!canManageBalances) {
        console.warn(
          `[UpdateCardUseCase] Permissão canManageBalances negada para partyId=${session.partyId}, contextId=${session.contextId}`
        )
        return failure(
          "Sem permissão para gerenciar os cartões deste contexto!"
        )
      }

      const existingCard = await this.cardRepository.findByIdAndContextId(
        data.id,
        session.contextId
      )
      if (!existingCard) {
        return failure("Cartão não encontrado.")
      }

      if (existingCard.isArchived) {
        return failure("Não é possível editar um cartão arquivado.")
      }

      const updatedCard = await this.cardRepository.update(
        data.id,
        session.contextId,
        {
          name: data.name,
          limit: data.limit,
          closingDay: data.closingDay,
          dueDay: data.dueDay,
        }
      )

      return success(updatedCard)
    } catch (error) {
      console.error("[UpdateCardUseCase] Falha crítica:", error)
      return failure("Ocorreu um erro interno. Tente novamente mais tarde.")
    }
  }
}
