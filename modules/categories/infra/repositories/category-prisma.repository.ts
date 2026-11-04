import { prisma } from "@/lib/prisma";
import type {
  CategoryItem,
  CategoryEntity,
  ArchiveCategoryResult,
  ArchiveSubcategoryResult,
  RestoreCategoryResult,
  RestoreSubcategoryResult,
} from "@/modules/categories/models/category.schema";
import type {
  CreateCategoryRepositoryDTO,
  ICategoryRepository,
} from "../../application/interfaces/category-repository.interface";
import {
  CategoryPolicy,
  CategoryDomainError,
  CategoryStateConflictError,
} from "../../application/policies/category.policy";
import { CategoryMapper } from "../mappers/category.mapper";

export class CategoryPrismaRepository implements ICategoryRepository {
  async findByIdAndContextId(
    id: number,
    contextId: number
  ): Promise<CategoryEntity | null> {
    const balance = await prisma.balance.findFirst({
      where: {
        id,
        contextId,
        balanceType: "CATEGORY",
      },
      select: {
        id: true,
        name: true,
        contextId: true,
        parentId: true,
        removedAt: true,
      },
    });

    if (!balance) return null;

    return {
      id: balance.id,
      name: balance.name,
      contextId: balance.contextId,
      parentId: balance.parentId,
      removedAt: balance.removedAt,
      isArchived: balance.removedAt !== null,
    };
  }

  async findParentCategory(
    contextId: number,
    parentId: number
  ): Promise<{ id: number; parentId: number | null; removedAt: Date | null } | null> {
    const parent = await prisma.balance.findFirst({
      where: {
        id: parentId,
        contextId,
        balanceType: "CATEGORY",
      },
      select: {
        id: true,
        parentId: true,
        removedAt: true,
      },
    });

    return parent;
  }

  async create(
    contextId: number,
    data: CreateCategoryRepositoryDTO
  ): Promise<CategoryItem> {
    return await prisma.$transaction(async (tx) => {
      let parentEntity: CategoryEntity | null = null;

      if (data.parentId) {
        const parentRecord = await tx.balance.findFirst({
          where: {
            id: data.parentId,
            contextId,
            balanceType: "CATEGORY",
          },
          select: {
            id: true,
            name: true,
            contextId: true,
            parentId: true,
            removedAt: true,
          },
        });

        if (parentRecord) {
          parentEntity = {
            id: parentRecord.id,
            name: parentRecord.name,
            contextId: parentRecord.contextId,
            parentId: parentRecord.parentId,
            removedAt: parentRecord.removedAt,
            isArchived: parentRecord.removedAt !== null,
          };
        }
      }

      // Validação de política pura
      CategoryPolicy.validateCanCreateCategory(data, parentEntity);

      const hasAppearance = Boolean(data.icon || data.color);

      const created = await tx.balance.create({
        data: {
          contextId,
          name: data.name.trim(),
          balanceType: "CATEGORY",
          parentId: data.parentId ?? null,
          appearance: hasAppearance
            ? {
                create: {
                  icon: data.icon ?? null,
                  color: data.color ?? null,
                },
              }
            : undefined,
        },
        include: {
          appearance: true,
        },
      });

      return CategoryMapper.toItem(created);
    });
  }

  async archiveCategory(
    id: number,
    contextId: number
  ): Promise<ArchiveCategoryResult> {
    return await prisma.$transaction(async (tx) => {
      const record = await tx.balance.findFirst({
        where: {
          id,
          contextId,
          balanceType: "CATEGORY",
        },
        select: {
          id: true,
          name: true,
          contextId: true,
          parentId: true,
          removedAt: true,
        },
      });

      if (!record) {
        throw new CategoryDomainError("Categoria não encontrada.", "NOT_FOUND");
      }

      const entity: CategoryEntity = {
        id: record.id,
        name: record.name,
        contextId: record.contextId,
        parentId: record.parentId,
        removedAt: record.removedAt,
        isArchived: record.removedAt !== null,
      };

      CategoryPolicy.validateCanArchiveCategory(entity);

      // Localiza filhas ainda ativas (removedAt === null)
      const activeChildren = await tx.balance.findMany({
        where: {
          contextId,
          balanceType: "CATEGORY",
          parentId: id,
          removedAt: null,
        },
        select: { id: true },
      });

      const now = new Date();

      // Atualiza a categoria raiz garantindo que ainda está ativa
      const updateRootResult = await tx.balance.updateMany({
        where: {
          id,
          contextId,
          balanceType: "CATEGORY",
          parentId: null,
          removedAt: null,
        },
        data: {
          removedAt: now,
        },
      });

      if (updateRootResult.count === 0) {
        throw new CategoryStateConflictError();
      }

      // Em cascata: atualiza todas as subcategorias ativas com o EXATO mesmo timestamp
      if (activeChildren.length > 0) {
        const childIds = activeChildren.map((c) => c.id);
        await tx.balance.updateMany({
          where: {
            id: { in: childIds },
            contextId,
            balanceType: "CATEGORY",
            parentId: id,
            removedAt: null,
          },
          data: {
            removedAt: now,
          },
        });
      }

      return {
        id: record.id,
        name: record.name,
        archivedSubcategoriesCount: activeChildren.length,
      };
    });
  }

  async archiveSubcategory(
    id: number,
    contextId: number
  ): Promise<ArchiveSubcategoryResult> {
    return await prisma.$transaction(async (tx) => {
      const record = await tx.balance.findFirst({
        where: {
          id,
          contextId,
          balanceType: "CATEGORY",
        },
        select: {
          id: true,
          name: true,
          contextId: true,
          parentId: true,
          removedAt: true,
          parent: {
            select: {
              id: true,
              name: true,
              contextId: true,
              parentId: true,
              removedAt: true,
            },
          },
        },
      });

      if (!record) {
        throw new CategoryDomainError(
          "Subcategoria não encontrada.",
          "NOT_FOUND"
        );
      }

      const entity: CategoryEntity = {
        id: record.id,
        name: record.name,
        contextId: record.contextId,
        parentId: record.parentId,
        removedAt: record.removedAt,
        isArchived: record.removedAt !== null,
      };

      const parentEntity: CategoryEntity | null = record.parent
        ? {
            id: record.parent.id,
            name: record.parent.name,
            contextId: record.parent.contextId,
            parentId: record.parent.parentId,
            removedAt: record.parent.removedAt,
            isArchived: record.parent.removedAt !== null,
          }
        : null;

      CategoryPolicy.validateCanArchiveSubcategory(entity, parentEntity);

      const now = new Date();
      const updateResult = await tx.balance.updateMany({
        where: {
          id,
          contextId,
          balanceType: "CATEGORY",
          removedAt: null,
        },
        data: {
          removedAt: now,
        },
      });

      if (updateResult.count === 0) {
        throw new CategoryStateConflictError();
      }

      return {
        id: record.id,
        name: record.name,
      };
    });
  }

  async restoreCategory(
    id: number,
    contextId: number
  ): Promise<RestoreCategoryResult> {
    return await prisma.$transaction(async (tx) => {
      const record = await tx.balance.findFirst({
        where: {
          id,
          contextId,
          balanceType: "CATEGORY",
        },
        select: {
          id: true,
          name: true,
          contextId: true,
          parentId: true,
          removedAt: true,
          _count: {
            select: {
              children: {
                where: {
                  balanceType: "CATEGORY",
                  removedAt: { not: null },
                },
              },
            },
          },
        },
      });

      if (!record) {
        throw new CategoryDomainError("Categoria não encontrada.", "NOT_FOUND");
      }

      const entity: CategoryEntity = {
        id: record.id,
        name: record.name,
        contextId: record.contextId,
        parentId: record.parentId,
        removedAt: record.removedAt,
        isArchived: record.removedAt !== null,
      };

      CategoryPolicy.validateCanRestoreCategory(entity);

      const updateResult = await tx.balance.updateMany({
        where: {
          id,
          contextId,
          balanceType: "CATEGORY",
          parentId: null,
          removedAt: { not: null },
        },
        data: {
          removedAt: null,
        },
      });

      if (updateResult.count === 0) {
        throw new CategoryStateConflictError();
      }

      return {
        id: record.id,
        name: record.name,
        remainingArchivedSubcategoriesCount: record._count.children,
      };
    });
  }

  async restoreSubcategory(
    id: number,
    contextId: number
  ): Promise<RestoreSubcategoryResult> {
    return await prisma.$transaction(async (tx) => {
      const record = await tx.balance.findFirst({
        where: {
          id,
          contextId,
          balanceType: "CATEGORY",
        },
        select: {
          id: true,
          name: true,
          contextId: true,
          parentId: true,
          removedAt: true,
          parent: {
            select: {
              id: true,
              name: true,
              contextId: true,
              parentId: true,
              removedAt: true,
            },
          },
        },
      });

      if (!record) {
        throw new CategoryDomainError(
          "Subcategoria não encontrada.",
          "NOT_FOUND"
        );
      }

      const entity: CategoryEntity = {
        id: record.id,
        name: record.name,
        contextId: record.contextId,
        parentId: record.parentId,
        removedAt: record.removedAt,
        isArchived: record.removedAt !== null,
      };

      const parentEntity: CategoryEntity | null = record.parent
        ? {
            id: record.parent.id,
            name: record.parent.name,
            contextId: record.parent.contextId,
            parentId: record.parent.parentId,
            removedAt: record.parent.removedAt,
            isArchived: record.parent.removedAt !== null,
          }
        : null;

      CategoryPolicy.validateCanRestoreSubcategory(entity, parentEntity);

      const updateResult = await tx.balance.updateMany({
        where: {
          id,
          contextId,
          balanceType: "CATEGORY",
          removedAt: { not: null },
        },
        data: {
          removedAt: null,
        },
      });

      if (updateResult.count === 0) {
        throw new CategoryStateConflictError();
      }

      return {
        id: record.id,
        name: record.name,
      };
    });
  }
}
