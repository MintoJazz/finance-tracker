import { failure, success, Result } from "@/types/result.types";
import { UserContextOption } from "@/modules/space/models/context.schema";
import { IFinancialContextRepository } from "@/modules/space/application/interfaces/financial-context-repository.interface";

export interface GetUserContextsDTO {
  partyId: number;
}

export class GetUserContextsUseCase {
  constructor(
    private readonly contextRepository: IFinancialContextRepository
  ) {}

  async execute({ partyId }: GetUserContextsDTO): Promise<Result<UserContextOption[]>> {
    try {
      if (!partyId || partyId <= 0) {
        return failure("Identificador de usuário inválido.");
      }

      const contexts = await this.contextRepository.findActiveContextsByParty(partyId);
      return success(contexts ?? []);
    } catch (error) {
      console.error("[GetUserContextsUseCase] Falha ao buscar contextos do usuário:", error);
      return failure("Ocorreu um erro ao carregar os contextos do usuário.");
    }
  }
}
