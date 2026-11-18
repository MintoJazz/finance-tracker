import type { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import type { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import { failure, success } from "@/types/result.types";
import type { SetRecurrenceActiveInput } from "../../models/schemas/recurrence-status.schema";
import type { IRecurrenceRepository } from "../interfaces/recurrence-repository.interface";

export interface SetRecurrenceActiveUseCaseDTO {
    session: SessionPayload;
    data: SetRecurrenceActiveInput;
}

export class SetRecurrenceActiveUseCase {
    constructor(
        private readonly recurrenceRepository: IRecurrenceRepository,
        private readonly getSpaceAccess: ISpaceAccessProvider
    ) {}

    async execute({ session, data }: SetRecurrenceActiveUseCaseDTO) {
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
            if (existing.isArchived) {
                return failure("Não é possível alterar uma recorrência arquivada.");
            }
            if (existing.isActive === data.isActive) {
                return failure(
                    data.isActive
                        ? "Esta recorrência já está ativa."
                        : "Esta recorrência já está desativada."
                );
            }

            const updated = await this.recurrenceRepository.setActive(
                data.id,
                session.contextId,
                data.isActive
            );
            return success(updated);
        } catch (error) {
            console.error("[SetRecurrenceActiveUseCase] Falha crítica:", error);
            return failure("Ocorreu um erro interno. Tente novamente mais tarde.");
        }
    }
}
