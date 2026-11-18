import type { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import type { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import { CategoryDomainError } from "@/modules/categories/application/policies/category.policy";
import type { EditRecurrenceInput } from "@/modules/recurrences/models/schemas/recurrence-edit.schema";
import { failure, success, type Result } from "@/types/result.types";
import type { IRecurrenceUnitOfWork } from "../interfaces/recurrence-uow.interface";
import { RecurrenceDomainError } from "../policies/recurrence.policy";
import { resolveRecurrenceSubcategoryId } from "../services/recurrence-classification.resolver";

export interface UpdateRecurrenceUseCaseDTO {
    session: SessionPayload;
    data: EditRecurrenceInput;
}

export interface UpdateRecurrenceResult {
    id: number;
    name: string;
}

export class UpdateRecurrenceUseCase {
    constructor(
        private readonly unitOfWork: IRecurrenceUnitOfWork,
        private readonly getSpaceAccess: ISpaceAccessProvider
    ) {}

    async execute({
        session,
        data,
    }: UpdateRecurrenceUseCaseDTO): Promise<Result<UpdateRecurrenceResult>> {
        try {
            const access = await this.getSpaceAccess.execute(session);
            if (!access.success) {
                return failure(access.error!);
            }
            if (!access.data.canManageBalances) {
                return failure("Sem permissão para gerenciar as recorrências deste contexto!");
            }

            const contextId = session.contextId;

            // Categoria/subcategoria novas e a atualização na mesma transação
            const updated = await this.unitOfWork.run(async ({ categoryRepo, recurrenceRepo }) => {
                const existing = await recurrenceRepo.findByIdAndContextId(data.id, contextId);
                if (!existing) {
                    throw new RecurrenceDomainError(
                        "Recorrência não encontrada.",
                        "RECURRENCE_NOT_FOUND"
                    );
                }
                if (existing.isArchived) {
                    throw new RecurrenceDomainError(
                        "Não é possível editar uma recorrência arquivada.",
                        "RECURRENCE_ARCHIVED"
                    );
                }

                const subcategoryId = await resolveRecurrenceSubcategoryId(
                    categoryRepo,
                    contextId,
                    data
                );

                return recurrenceRepo.update(data.id, contextId, {
                    name: data.name,
                    subcategoryId,
                });
            });

            return success(updated);
        } catch (err) {
            if (err instanceof RecurrenceDomainError || err instanceof CategoryDomainError) {
                return failure(err.message);
            }
            console.error("[UpdateRecurrenceUseCase] Falha crítica:", err);
            return failure("Ocorreu um erro interno. Tente novamente mais tarde.");
        }
    }
}
