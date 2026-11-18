import type { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import type { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import { failure, success } from "@/types/result.types";
import type { ArchiveRecurrenceInput } from "../../models/schemas/recurrence-status.schema";
import type { IRecurrenceRepository } from "../interfaces/recurrence-repository.interface";

export interface ArchiveRecurrenceUseCaseDTO {
    session: SessionPayload;
    data: ArchiveRecurrenceInput;
}

export class ArchiveRecurrenceUseCase {
    constructor(
        private readonly recurrenceRepository: IRecurrenceRepository,
        private readonly getSpaceAccess: ISpaceAccessProvider
    ) {}

    async execute({ session, data }: ArchiveRecurrenceUseCaseDTO) {
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
            if (existing.isArchived) return failure("Esta recorrência já está arquivada.");

            const archived = await this.recurrenceRepository.archive(
                data.id,
                session.contextId
            );
            return success(archived);
        } catch (error) {
            console.error("[ArchiveRecurrenceUseCase] Falha crítica:", error);
            return failure("Ocorreu um erro interno. Tente novamente mais tarde.");
        }
    }
}
