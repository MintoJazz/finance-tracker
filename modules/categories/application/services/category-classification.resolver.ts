import type { ICategoryRepository } from "@/modules/categories/application/interfaces/category-repository.interface";
import {
  CategoryDomainError,
  CategoryPolicy,
} from "@/modules/categories/application/policies/category.policy";
import type { CategoryClassificationValues } from "@/modules/categories/models/category-classification.schema";

export type CategoryClassificationInput = CategoryClassificationValues;

/**
 * Resolve a classificação (categoria + subcategoria), criando as entidades novas ou
 * validando as existentes. Retorna o id da subcategoria, o único vínculo real
 * (`Balance.parentId`). Deve rodar dentro da mesma transação da escrita de quem classifica.
 */
export async function resolveSubcategoryId(
  categoryRepo: ICategoryRepository,
  contextId: number,
  data: CategoryClassificationInput
): Promise<number> {
  const categoryId = await resolveCategory(categoryRepo, contextId, data);
  return resolveSubcategory(categoryRepo, contextId, data, categoryId);
}

async function resolveCategory(
  categoryRepo: ICategoryRepository,
  contextId: number,
  data: CategoryClassificationInput
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
    const category = await categoryRepo.findByIdAndContextId(
      data.categoryId,
      contextId
    );
    return CategoryPolicy.validateExistingCategory(category).id;
  }

  return null;
}

async function resolveSubcategory(
  categoryRepo: ICategoryRepository,
  contextId: number,
  data: CategoryClassificationInput,
  categoryId: number | null
): Promise<number> {
  if (data.newSubcategory) {
    if (categoryId == null) {
      throw new CategoryDomainError(
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
    return CategoryPolicy.validateExistingSubcategory(subcategory, categoryId).id;
  }

  throw new CategoryDomainError(
    "Selecione ou crie uma subcategoria.",
    "SUBCATEGORY_REQUIRED"
  );
}
