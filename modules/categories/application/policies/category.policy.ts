import type { CategoryEntity } from "@/modules/categories/models/category.schema";

export class CategoryDomainError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = "CategoryDomainError";
  }
}

export class ParentCategoryArchivedError extends CategoryDomainError {
  constructor(
    message = "Restaure a categoria antes de restaurar esta subcategoria."
  ) {
    super(message, "PARENT_ARCHIVED");
  }
}

export class InvalidHierarchyLevelError extends CategoryDomainError {
  constructor(
    message = "Operação inválida para o nível da categoria informado."
  ) {
    super(message, "INVALID_HIERARCHY_LEVEL");
  }
}

export class CategoryStateConflictError extends CategoryDomainError {
  constructor(
    message = "O estado da categoria foi alterado por outra operação. Atualize a página e tente novamente."
  ) {
    super(message, "STATE_CONFLICT");
  }
}

export class CategoryPolicy {
  /** Categoria raiz existente: precisa existir, ser raiz e estar ativa. */
  static validateExistingCategory(category: CategoryEntity | null): CategoryEntity {
    if (!category) {
      throw new CategoryDomainError("Categoria não encontrada.", "CATEGORY_NOT_FOUND");
    }
    if (category.parentId !== null) {
      throw new CategoryDomainError(
        "A categoria informada é uma subcategoria.",
        "CATEGORY_IS_SUBCATEGORY"
      );
    }
    if (category.removedAt !== null || category.isArchived) {
      throw new CategoryDomainError(
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
      throw new CategoryDomainError(
        "Subcategoria não encontrada.",
        "SUBCATEGORY_NOT_FOUND"
      );
    }
    if (subcategory.parentId === null) {
      throw new CategoryDomainError(
        "A subcategoria informada é uma categoria raiz.",
        "SUBCATEGORY_IS_ROOT"
      );
    }
    if (subcategory.removedAt !== null || subcategory.isArchived) {
      throw new CategoryDomainError(
        "A subcategoria selecionada está arquivada.",
        "SUBCATEGORY_ARCHIVED"
      );
    }
    if (expectedCategoryId != null && subcategory.parentId !== expectedCategoryId) {
      throw new CategoryDomainError(
        "A subcategoria não pertence à categoria selecionada.",
        "SUBCATEGORY_PARENT_MISMATCH"
      );
    }
    return subcategory;
  }

  /**
   * Valida se uma categoria raiz pode ser arquivada.
   * Regra 1: Arquiva a categoria e, em cascata, todas as subcategorias ainda ativas.
   * Exige que a categoria seja raiz (parentId === null) e esteja ativa (removedAt === null).
   */
  static validateCanArchiveCategory(category: CategoryEntity): void {
    if (category.parentId !== null) {
      throw new InvalidHierarchyLevelError(
        "Operação inválida: o identificador informado pertence a uma subcategoria."
      );
    }

    if (category.removedAt !== null || category.isArchived) {
      throw new CategoryDomainError(
        "Esta categoria já está arquivada.",
        "ALREADY_ARCHIVED"
      );
    }
  }

  /**
   * Valida se uma subcategoria pode ser arquivada.
   * Regra 2: Arquiva somente a subcategoria. O pai não é afetado.
   * Exige que seja uma subcategoria (parentId !== null) e esteja ativa (removedAt === null).
   * Regra 5: Pai arquivado com subcategoria ativa viola o invariante de dados.
   */
  static validateCanArchiveSubcategory(
    subcategory: CategoryEntity,
    parent: CategoryEntity | null
  ): void {
    if (subcategory.parentId === null) {
      throw new InvalidHierarchyLevelError(
        "Operação inválida: o identificador informado pertence a uma categoria raiz."
      );
    }

    if (subcategory.removedAt !== null || subcategory.isArchived) {
      throw new CategoryDomainError(
        "Esta subcategoria já está arquivada.",
        "ALREADY_ARCHIVED"
      );
    }

    if (parent && (parent.removedAt !== null || parent.isArchived)) {
      throw new CategoryDomainError(
        "Inconsistência de dados: a categoria pai já está arquivada.",
        "DATA_INCONSISTENCY"
      );
    }
  }

  /**
   * Valida se uma categoria raiz pode ser restaurada.
   * Regra 3: Restaura somente a categoria raiz.
   * Exige que a categoria seja raiz (parentId === null) e esteja arquivada (removedAt !== null).
   */
  static validateCanRestoreCategory(category: CategoryEntity): void {
    if (category.parentId !== null) {
      throw new InvalidHierarchyLevelError(
        "Operação inválida: o identificador informado pertence a uma subcategoria."
      );
    }

    if (category.removedAt === null && !category.isArchived) {
      throw new CategoryDomainError(
        "Esta categoria não está arquivada.",
        "NOT_ARCHIVED"
      );
    }
  }

  /**
   * Valida se uma subcategoria pode ser restaurada.
   * Regra 4: Só é permitido se a categoria pai está ativa.
   * Caso contrário, erro de domínio específico e distinguível (PARENT_ARCHIVED).
   */
  static validateCanRestoreSubcategory(
    subcategory: CategoryEntity,
    parent: CategoryEntity | null
  ): void {
    if (subcategory.parentId === null) {
      throw new InvalidHierarchyLevelError(
        "Operação inválida: o identificador informado pertence a uma categoria raiz."
      );
    }

    if (subcategory.removedAt === null && !subcategory.isArchived) {
      throw new CategoryDomainError(
        "Esta subcategoria não está arquivada.",
        "NOT_ARCHIVED"
      );
    }

    if (!parent || parent.removedAt !== null || parent.isArchived) {
      throw new ParentCategoryArchivedError(
        "Restaure a categoria antes de restaurar esta subcategoria."
      );
    }

    if (parent.parentId !== null) {
      throw new InvalidHierarchyLevelError(
        "A categoria pai não pode ser uma subcategoria."
      );
    }
  }

  /**
   * Valida criação de subcategoria ou categoria raiz.
   * Regra 6: Hierarquia máxima de um nível (subcategoria não pode ter filhas).
   */
  static validateCanCreateCategory(
    data: { name: string; parentId?: number | null },
    parent?: CategoryEntity | null
  ): void {
    const trimmed = data.name.trim();
    if (!trimmed) {
      throw new CategoryDomainError(
        "O nome da categoria é obrigatório.",
        "EMPTY_NAME"
      );
    }

    if (data.parentId) {
      if (!parent) {
        throw new CategoryDomainError(
          "Categoria pai não encontrada no contexto atual.",
          "PARENT_NOT_FOUND"
        );
      }

      if (parent.parentId !== null) {
        throw new InvalidHierarchyLevelError(
          "Não é permitido criar subcategorias dentro de outra subcategoria."
        );
      }

      if (parent.removedAt !== null || parent.isArchived) {
        throw new ParentCategoryArchivedError(
          "Não é permitido criar subcategorias sob uma categoria arquivada."
        );
      }
    }
  }

  /**
   * Valida atualização de uma categoria existente.
   * Não é permitido editar categorias arquivadas ou com nome em branco.
   */
  static validateCanUpdateCategory(
    category: CategoryEntity,
    data: { name: string }
  ): void {
    if (category.removedAt !== null || category.isArchived) {
      throw new CategoryDomainError(
        "Não é possível editar uma categoria arquivada.",
        "ALREADY_ARCHIVED"
      );
    }

    const trimmed = data.name.trim();
    if (!trimmed) {
      throw new CategoryDomainError(
        "O nome da categoria é obrigatório.",
        "EMPTY_NAME"
      );
    }
  }
}

