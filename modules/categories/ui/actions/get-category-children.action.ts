"use server";

import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { failure, success, type Result } from "@/types/result.types";
import type { CategoryItem } from "@/modules/categories/models/category.schema";
import { CategoriesMockService } from "@/modules/categories/infra/mock/categories.mock";

export interface GetCategoryChildrenParams {
  parentId: number;
  from?: Date;
  to?: Date;
}

export async function getCategoryChildrenAction(
  params: GetCategoryChildrenParams
): Promise<Result<CategoryItem[]>> {
  const session = await SessionHandler.getSession();
  if (!session) {
    return failure("Não autenticado");
  }

  // Simular latência de rede para feedback visual elegante da UI
  await new Promise((resolve) => setTimeout(resolve, 250));

  const children = CategoriesMockService.listCategoryChildren(params.parentId);

  return success(children);
}

