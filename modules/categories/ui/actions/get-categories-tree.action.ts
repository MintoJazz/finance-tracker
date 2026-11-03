"use server";

import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { failure, success, type Result } from "@/types/result.types";
import type {
  CategoryTreeDTO,
  CategoryTreeFilter,
} from "@/modules/categories/models/category.schema";
import { CategoriesMockService } from "@/modules/categories/infra/mock/categories.mock";

const DEFAULT_PERIOD = {
  from: new Date(2026, 9, 1), // 01/10/2026
  to: new Date(2026, 9, 31), // 31/10/2026
};

export async function getCategoriesTreeAction(
  filter?: CategoryTreeFilter
): Promise<Result<CategoryTreeDTO>> {
  const session = await SessionHandler.getSession();
  if (!session) {
    return failure("Não autenticado");
  }

  const period = {
    from: filter?.from ?? DEFAULT_PERIOD.from,
    to: filter?.to ?? DEFAULT_PERIOD.to,
  };

  const page = CategoriesMockService.listParentCategories({
    search: filter?.search,
    pageRequest: filter?.pageRequest ?? { page: 1, pageSize: 6 },
  });

  const totalAmount = CategoriesMockService.getTotalAmount();

  return success({
    period,
    totalAmount,
    page,
    items: page.data,
  });
}
