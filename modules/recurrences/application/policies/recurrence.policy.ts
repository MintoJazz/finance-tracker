import type { CategoryEntity } from "@/modules/categories/models/category.schema";

export class RecurrenceDomainError extends Error {
    constructor(
        message: string,
        public readonly code: string
    ) {
        super(message);
        this.name = "RecurrenceDomainError";
    }
}

export class RecurrencePolicy {
    /** Categoria raiz existente: precisa existir, ser raiz e estar ativa. */
    static validateExistingCategory(category: CategoryEntity | null): CategoryEntity {
        if (!category) {
            throw new RecurrenceDomainError("Categoria não encontrada.", "CATEGORY_NOT_FOUND");
        }
        if (category.parentId !== null) {
            throw new RecurrenceDomainError(
                "A categoria informada é uma subcategoria.",
                "CATEGORY_IS_SUBCATEGORY"
            );
        }
        if (category.removedAt !== null || category.isArchived) {
            throw new RecurrenceDomainError(
                "A categoria selecionada está arquivada.",
                "CATEGORY_ARCHIVED"
            );
        }
        return category;
    }

    /**
     * Subcategoria existente: precisa existir, ter pai, estar ativa e,
     * quando a categoria foi informada, pertencer a ela.
     */
    static validateExistingSubcategory(
        subcategory: CategoryEntity | null,
        expectedCategoryId?: number | null
    ): CategoryEntity {
        if (!subcategory) {
            throw new RecurrenceDomainError("Subcategoria não encontrada.", "SUBCATEGORY_NOT_FOUND");
        }
        if (subcategory.parentId === null) {
            throw new RecurrenceDomainError(
                "A subcategoria informada é uma categoria raiz.",
                "SUBCATEGORY_IS_ROOT"
            );
        }
        if (subcategory.removedAt !== null || subcategory.isArchived) {
            throw new RecurrenceDomainError(
                "A subcategoria selecionada está arquivada.",
                "SUBCATEGORY_ARCHIVED"
            );
        }
        if (expectedCategoryId != null && subcategory.parentId !== expectedCategoryId) {
            throw new RecurrenceDomainError(
                "A subcategoria não pertence à categoria selecionada.",
                "SUBCATEGORY_PARENT_MISMATCH"
            );
        }
        return subcategory;
    }
}
