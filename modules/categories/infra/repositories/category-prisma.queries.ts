import { prisma } from "@/lib/prisma";
import type { BalanceWhereInput } from "@/prisma/generated/prisma/models";
import type { Page, PageRequest } from "@/types/pagination.types";
import type {
  CategoryItem,
  ArchivedCategoryGroup,
  CategoryOptionDTO,
  SubcategoryOptionDTO,
} from "@/modules/categories/models/category.schema";
import type {
  CategoryDetailFoundDTO,
  ICategoryQueries,
} from "../../application/interfaces/category-queries.interface";
import { CategoryMapper } from "../mappers/category.mapper";

export class CategoryPrismaQueries implements ICategoryQueries {
  async listRootCategories(
    contextId: number,
    pageRequest: PageRequest,
    filter?: { search?: string }
  ): Promise<Page<CategoryItem>> {
    const where: BalanceWhereInput = {
      contextId,
      balanceType: "CATEGORY",
      parentId: null,
      removedAt: null,
    };

    const search = filter?.search?.trim();
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        {
          children: {
            some: {
              balanceType: "CATEGORY",
              removedAt: null,
              name: { contains: search, mode: "insensitive" },
            },
          },
        },
      ];
    }

    const rawPage = Number(pageRequest.page);
    const rawPageSize = Number(pageRequest.pageSize);
    const page = !Number.isNaN(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
    const pageSize =
      !Number.isNaN(rawPageSize) && rawPageSize > 0
        ? Math.floor(rawPageSize)
        : 6;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const [rawItems, total] = await Promise.all([
      prisma.balance.findMany({
        where,
        skip,
        take,
        include: {
          appearance: true,
          _count: {
            select: {
              children: {
                where: {
                  balanceType: "CATEGORY",
                  removedAt: null,
                },
              },
            },
          },
        },
        orderBy: { name: "asc" },
      }),
      prisma.balance.count({ where }),
    ]);

    const items = rawItems.map((raw) => CategoryMapper.toItem(raw));

    return {
      data: items,
      total,
      pageIndex: page - 1,
      pageSize,
      pageCount: Math.ceil(total / pageSize) || 1,
    };
  }

  async listCategoryChildren(
    contextId: number,
    parentId: number
  ): Promise<CategoryItem[]> {
    const rawItems = await prisma.balance.findMany({
      where: {
        contextId,
        balanceType: "CATEGORY",
        parentId,
        removedAt: null,
      },
      include: {
        appearance: true,
      },
      orderBy: { name: "asc" },
    });

    return rawItems.map((raw) => CategoryMapper.toItem(raw));
  }

  async findCategoryById(
    contextId: number,
    categoryId: number
  ): Promise<CategoryDetailFoundDTO | null> {
    const found = await prisma.balance.findFirst({
      where: {
        id: categoryId,
        contextId,
        balanceType: "CATEGORY",
        removedAt: null,
      },
      include: {
        appearance: true,
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            children: {
              where: {
                balanceType: "CATEGORY",
                removedAt: null,
              },
            },
          },
        },
      },
    });

    if (!found) return null;

    return {
      id: found.id,
      name: found.name,
      parentId: found.parentId,
      icon: found.appearance?.icon ?? null,
      color: found.appearance?.color ?? null,
      parentName: found.parent?.name ?? null,
      childrenCount: found._count.children,
    };
  }

  async listArchivedCategories(
    contextId: number
  ): Promise<ArchivedCategoryGroup[]> {
    // 1. Busca todas as categorias e subcategorias arquivadas do contexto ativo
    const archivedBalances = await prisma.balance.findMany({
      where: {
        contextId,
        balanceType: "CATEGORY",
        removedAt: { not: null },
      },
      select: {
        id: true,
        name: true,
        parentId: true,
        removedAt: true,
      },
      orderBy: { name: "asc" },
    });

    if (archivedBalances.length === 0) {
      return [];
    }

    // 2. Localiza IDs de pais ativos de subcategorias arquivadas
    const archivedIdsSet = new Set(archivedBalances.map((b) => b.id));
    const activeParentIdsNeeded = Array.from(
      new Set(
        archivedBalances
          .map((b) => b.parentId)
          .filter(
            (parentId): parentId is number =>
              parentId !== null && !archivedIdsSet.has(parentId)
          )
      )
    );

    // 3. Se houver pais ativos, busca-os em lote (apenas do mesmo contexto)
    let activeParents: Array<{
      id: number;
      name: string;
      parentId: number | null;
      removedAt: Date | null;
    }> = [];

    if (activeParentIdsNeeded.length > 0) {
      activeParents = await prisma.balance.findMany({
        where: {
          id: { in: activeParentIdsNeeded },
          contextId,
          balanceType: "CATEGORY",
          parentId: null,
          removedAt: null,
        },
        select: {
          id: true,
          name: true,
          parentId: true,
          removedAt: true,
        },
        orderBy: { name: "asc" },
      });
    }

    // 4. Mapeia e agrupa os dados preservando regras de domínio
    return CategoryMapper.toArchivedGroups(archivedBalances, activeParents);
  }

  async listActiveCategoryOptions(
    contextId: number
  ): Promise<CategoryOptionDTO[]> {
    if (!contextId || contextId <= 0) return [];

    const raw = await prisma.balance.findMany({
      where: {
        contextId,
        balanceType: "CATEGORY",
        parentId: null,
        removedAt: null,
      },
      include: {
        appearance: true,
      },
      orderBy: { name: "asc" },
    });

    return raw.map((cat) => CategoryMapper.toCategoryOption(cat));
  }

  async listActiveSubcategoryOptions(
    contextId: number
  ): Promise<SubcategoryOptionDTO[]> {
    if (!contextId || contextId <= 0) return [];

    const raw = await prisma.balance.findMany({
      where: {
        contextId,
        balanceType: "CATEGORY",
        parentId: { not: null },
        removedAt: null,
        parent: {
          removedAt: null,
        },
      },
      include: {
        appearance: true,
        parent: {
          select: {
            id: true,
            name: true,
            appearance: true,
          },
        },
      },
      orderBy: [
        { parent: { name: "asc" } },
        { name: "asc" },
      ],
    });

    return raw.map((sub) =>
      CategoryMapper.toSubcategoryOption({
        ...sub,
        parentId: sub.parentId!,
      })
    );
  }
}

