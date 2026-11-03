import { prisma } from "@/lib/prisma";
import type { CategoryItem } from "@/modules/categories/models/category.schema";
import type {
  CreateCategoryRepositoryDTO,
  ICategoryRepository,
} from "../../application/interfaces/category-repository.interface";
import { CategoryMapper } from "../mappers/category.mapper";

export class CategoryPrismaRepository implements ICategoryRepository {
  async create(
    contextId: number,
    data: CreateCategoryRepositoryDTO
  ): Promise<CategoryItem> {
    const hasAppearance = Boolean(data.icon || data.color);

    const created = await prisma.balance.create({
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
  }

  async findParentCategory(
    contextId: number,
    parentId: number
  ): Promise<{ id: number; parentId: number | null } | null> {
    const parent = await prisma.balance.findFirst({
      where: {
        id: parentId,
        contextId,
        balanceType: "CATEGORY",
        removedAt: null,
      },
      select: {
        id: true,
        parentId: true,
      },
    });

    return parent;
  }
}

