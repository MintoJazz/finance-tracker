import { failure, success, Result } from "@/types/result.types";
import { IContextMemberRepository } from "../types/context-member-repository.interface";

export interface SwitchContextDTO {
  partyId: number;
  targetContextId: number;
}

export class SwitchContextUseCase {
  constructor(
    private readonly memberRepository: IContextMemberRepository
  ) {}

  async execute({ partyId, targetContextId }: SwitchContextDTO): Promise<Result<{ contextId: number }>> {
    try {
      if (!partyId || partyId <= 0 || !targetContextId || targetContextId <= 0) {
        return failure("Parâmetros de contexto inválidos.");
      }

      const member = await this.memberRepository.findByContextAndParty(targetContextId, partyId);
      if (member?.status !== "ACTIVE") {
        console.warn(`[SwitchContextUseCase] Acesso negado: vínculo ativo não encontrado para partyId=${partyId}, contextId=${targetContextId}`);
        return failure("Você não tem permissão para acessar este espaço financeiro.");
      }

      return success({ contextId: targetContextId });
    } catch (error) {
      console.error("[SwitchContextUseCase] Falha crítica:", error);
      return failure("Ocorreu um erro ao alternar de contexto.");
    }
  }
}
