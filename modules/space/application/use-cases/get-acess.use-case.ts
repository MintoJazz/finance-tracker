import { failure, success } from "@/types/result.types";
import { SpacePolicy } from "@/modules/space/application/policies/space.policy";
import { IContextMemberRepository } from "@/modules/space/application/interfaces/context-member-repository.interface";

interface GetSpaceAccessUseCaseDTO {
    contextId: number;
    partyId: number;
}

export class GetSpaceAccessUseCase {
    constructor(
        private readonly memberRepository: IContextMemberRepository
    ) { }

    async execute({ contextId, partyId }: GetSpaceAccessUseCaseDTO) {
        try {
            const member = await this.memberRepository.findByContextAndParty(contextId, partyId);
            if (!member) {
                console.warn(`[GetSpaceAccessUseCase] Acesso negado: vínculo não encontrado para contextId=${contextId} e partyId=${partyId}`);
                return failure("Sem permissão para acessar este contexto!");
            }

            const { canViewBalances, canManageBalances } = SpacePolicy;

            return success({
                canViewBalances: canViewBalances(member),
                canManageBalances: canManageBalances(member),
            });
        } catch (error) {
            console.error("[GetSpaceAccessUseCase] Falha crítica:", error);
            return failure("Ocorreu um erro interno. Tente novamente mais tarde.");
        }
    }
}