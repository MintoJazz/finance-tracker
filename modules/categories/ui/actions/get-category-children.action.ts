"use server";

import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { failure, type Result } from "@/types/result.types";
import type { CategoryItem } from "@/modules/categories/models/category.schema";
import { CategoryFactory } from "@/modules/categories/infra/factories/category.factory";

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

  const useCase = CategoryFactory.makeGetCategoryChildrenUseCase();
  return await useCase.execute({
    session,
    parentId: params.parentId,
  });
}
