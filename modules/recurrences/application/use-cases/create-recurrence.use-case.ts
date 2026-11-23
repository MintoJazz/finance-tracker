import type { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import type { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import { CategoryDomainError } from "@/modules/categories/application/policies/category.policy";
import { resolveSubcategoryId } from "@/modules/categories/application/services/category-classification.resolver";
import type { CreateRecurrenceFormValues } from "@/modules/recurrences/models/schemas/recurrence-form.schema";
import { failure, success, type Result } from "@/types/result.types";
import type { IRecurrenceUnitOfWork } from "../interfaces/recurrence-uow.interface";

export interface CreateRecurrenceUseCaseDTO {
    session: SessionPayload;
    data: CreateRecurrenceFormValues;
}

export interface CreateRecurrenceResult {
    id: number;
    name: string;
}

export class CreateRecurrenceUseCase {
    constructor(
        private readonly unitOfWork: IRecurrenceUnitOfWork,
        private readonly getSpaceAccess: ISpaceAccessProvider
    ) {}

    async execute({
        session,
        data,
    }: CreateRecurrenceUseCaseDTO): Promise<Result<CreateRecurrenceResult>> {
        try {
            const { success: accessSuccess, data: accessData, error } =
                await this.getSpaceAccess.execute(session);
            if (!accessSuccess) {
                console.warn(
                    `[CreateRecurrenceUseCase] Falha de acesso ao espaço para partyId=${session.partyId}, contextId=${session.contextId}:`,
                    error
                );
                return failure(error!);
            }

            if (!accessData.canManageBalances) {
                console.warn(
                    `[CreateRecurrenceUseCase] Permissão canManageBalances negada para partyId=${session.partyId}, contextId=${session.contextId}`
                );
                return failure("Sem permissão para criar recorrências neste contexto!");
            }

            const contextId = session.contextId;

            // Categoria, subcategoria e recorrência na mesma transação
            const created = await this.unitOfWork.run(async ({ categoryRepo, recurrenceRepo }) => {
                // 1. Categoria e subcategoria (novas ou existentes)
                const subcategoryId = await resolveSubcategoryId(
                    categoryRepo,
                    contextId,
                    data
                );

                // 2. Balance + Agreement + CycleRule + valor inicial
                return recurrenceRepo.create({
                    contextId,
                    direction: data.direction,
                    name: data.name,
                    amount: data.amount,
                    frequency: data.frequency,
                    startDate: data.startDate,
                    hasCustomClosingDate: data.hasCustomClosingDate,
                    dueDay: data.dueDay,
                    closingDay: data.closingDay,
                    dueMonth: data.dueMonth,
                    closingMonth: data.closingMonth,
                    subcategoryId,
                });
            });

            return success(created);
        } catch (err) {
            if (err instanceof CategoryDomainError) {
                return failure(err.message);
            }
            console.error("[CreateRecurrenceUseCase] Falha crítica:", err);
            return failure("Ocorreu um erro interno. Tente novamente mais tarde.");
        }
    }
}
