import type { ICategoryRepository } from "@/modules/categories/application/interfaces/category-repository.interface";
import type { RecurrenceFormValues } from "@/modules/recurrences/models/schemas/recurrence-form.schema";
import { RecurrenceDomainError, RecurrencePolicy } from "../policies/recurrence.policy";

export type RecurrenceClassificationInput = Pick<
    RecurrenceFormValues,
    "categoryId" | "newCategory" | "subcategoryId" | "newSubcategory"
>;

/**
 * Resolve a classificação (categoria + subcategoria) de uma recorrência,
 * criando as entidades novas ou validando as existentes. Retorna o id da
 * subcategoria — o único vínculo real (`Balance.parentId`).
 * Deve rodar dentro da mesma transação da escrita da recorrência.
 */
export async function resolveRecurrenceSubcategoryId(
    categoryRepo: ICategoryRepository,
    contextId: number,
    data: RecurrenceClassificationInput
): Promise<number> {
    const categoryId = await resolveCategory(categoryRepo, contextId, data);
    return resolveSubcategory(categoryRepo, contextId, data, categoryId);
}

async function resolveCategory(
    categoryRepo: ICategoryRepository,
    contextId: number,
    data: RecurrenceClassificationInput
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

async function resolveSubcategory(
    categoryRepo: ICategoryRepository,
    contextId: number,
    data: RecurrenceClassificationInput,
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
