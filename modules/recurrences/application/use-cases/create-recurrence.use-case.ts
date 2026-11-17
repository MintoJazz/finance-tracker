import type { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import type { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import type { ICategoryRepository } from "@/modules/categories/application/interfaces/category-repository.interface";
import { CategoryDomainError } from "@/modules/categories/application/policies/category.policy";
import type { CreateRecurrenceFormValues } from "@/modules/recurrences/models/schemas/recurrence-form.schema";
import { failure, success, type Result } from "@/types/result.types";
import type { IRecurrenceUnitOfWork } from "../interfaces/recurrence-uow.interface";
import { RecurrenceDomainError, RecurrencePolicy } from "../policies/recurrence.policy";

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
                // 1. Categoria (nova ou existente)
                const categoryId = await this.resolveCategory(categoryRepo, contextId, data);

                // 2. Subcategoria (nova ou existente)
                const subcategoryId = await this.resolveSubcategory(
                    categoryRepo,
                    contextId,
                    data,
                    categoryId
                );

                // 3. Balance + Agreement + CycleRule + valor inicial
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
            if (err instanceof RecurrenceDomainError || err instanceof CategoryDomainError) {
                return failure(err.message);
            }
            console.error("[CreateRecurrenceUseCase] Falha crítica:", err);
            return failure("Ocorreu um erro interno. Tente novamente mais tarde.");
        }
    }

    private async resolveCategory(
        categoryRepo: ICategoryRepository,
        contextId: number,
        data: CreateRecurrenceFormValues
    ): Promise<number | null> {
        if (data.newCategory) {
            const created = await categoryRepo.create(contextId, {
                name: data.newCategory.name,
                color: data.newCategory.color,
                icon: data.newCategory.icon,
                parentId: null,
            });
            return created.id;
        }

        if (data.categoryId != null) {
            const category = await categoryRepo.findByIdAndContextId(data.categoryId, contextId);
            return RecurrencePolicy.validateExistingCategory(category).id;
        }

        return null;
    }

    private async resolveSubcategory(
        categoryRepo: ICategoryRepository,
        contextId: number,
        data: CreateRecurrenceFormValues,
        categoryId: number | null
    ): Promise<number> {
        if (data.newSubcategory) {
            if (categoryId == null) {
                throw new RecurrenceDomainError(
                    "Informe a categoria da nova subcategoria.",
                    "CATEGORY_REQUIRED"
                );
            }
            const created = await categoryRepo.create(contextId, {
                name: data.newSubcategory.name,
                color: data.newSubcategory.color,
                icon: data.newSubcategory.icon,
                parentId: categoryId,
            });
            return created.id;
        }

        if (data.subcategoryId != null) {
            const subcategory = await categoryRepo.findByIdAndContextId(
                data.subcategoryId,
                contextId
            );
            return RecurrencePolicy.validateExistingSubcategory(subcategory, categoryId).id;
        }

        throw new RecurrenceDomainError("Selecione ou crie uma subcategoria.", "SUBCATEGORY_REQUIRED");
    }
}
