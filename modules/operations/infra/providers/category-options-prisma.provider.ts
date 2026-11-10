import type {
  ICategoryOptionsProvider,
  ISubcategoryOptionsProvider,
} from "../../application/interfaces/operation-options-provider.interface"
import type {
  CategoryOption,
  SubcategoryOption,
} from "../../models/operation-options.schema"
import type { ICategoryQueries } from "@/modules/categories/application/interfaces/category-queries.interface"
import { CategoryPrismaQueries } from "@/modules/categories/infra/repositories/category-prisma.queries"

export class CategoryOptionsPrismaProvider
  implements ICategoryOptionsProvider, ISubcategoryOptionsProvider
{
  constructor(
    private readonly categoryQueries: ICategoryQueries = new CategoryPrismaQueries()
  ) {}

  async listCategoryOptions(spaceId?: number): Promise<CategoryOption[]> {
    if (!spaceId || spaceId <= 0) return []
    return this.categoryQueries.listActiveCategoryOptions(spaceId)
  }

  async listSubcategoryOptions(
    spaceId?: number
  ): Promise<SubcategoryOption[]> {
    if (!spaceId || spaceId <= 0) return []
    return this.categoryQueries.listActiveSubcategoryOptions(spaceId)
  }
}

