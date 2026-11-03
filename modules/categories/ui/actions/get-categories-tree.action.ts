"use server";

import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { failure, type Result } from "@/types/result.types";
import type {
  CategoryTreeDTO,
  CategoryTreeFilter,
} from "@/modules/categories/models/category.schema";
import { CategoryFactory } from "@/modules/categories/infra/factories/category.factory";

export async function getCategoriesTreeAction(
  filter?: CategoryTreeFilter
): Promise<Result<CategoryTreeDTO>> {
  const session = await SessionHandler.getSession();
  if (!session) {
    return failure("Não autenticado");
  }

  const useCase = CategoryFactory.makeGetCategoriesTreeUseCase();
  return await useCase.execute({ session, filter });
}
