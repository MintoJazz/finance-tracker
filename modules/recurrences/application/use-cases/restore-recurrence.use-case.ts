import type { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import type { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import { failure, success } from "@/types/result.types";
import type { RestoreRecurrenceInput } from "../../models/schemas/recurrence-status.schema";
import type { IRecurrenceRepository } from "../interfaces/recurrence-repository.interface";

export interface RestoreRecurrenceUseCaseDTO {
    session: SessionPayload;
    data: RestoreRecurrenceInput;
}

export class RestoreRecurrenceUseCase {
    constructor(
        private readonly recurrenceRepository: IRecurrenceRepository,
        private readonly getSpaceAccess: ISpaceAccessProvider
    ) {}

    async execute({ session, data }: RestoreRecurrenceUseCaseDTO) {
        try {
            const access = await this.getSpaceAccess.execute(session);
            if (!access.success) {
                return failure(access.error!);
            }
            if (!access.data.canManageBalances) {
                return failure("Sem permissão para gerenciar as recorrências deste contexto!");
            }

            const existing = await this.recurrenceRepository.findByIdAndContextId(
                data.id,
                session.contextId
            );
            if (!existing) return failure("Recorrência não encontrada.");
            if (!existing.isArchived) return failure("Esta recorrência não está arquivada.");

            const restored = await this.recurrenceRepository.restore(
                data.id,
                session.contextId
            );
            return success(restored);
        } catch (error) {
            console.error("[RestoreRecurrenceUseCase] Falha crítica:", error);
            return failure("Ocorreu um erro interno. Tente novamente mais tarde.");
        }
    }
}
