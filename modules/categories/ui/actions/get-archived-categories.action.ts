"use server";

import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { failure, type Result } from "@/types/result.types";
import type { ArchivedCategoryGroup } from "@/modules/categories/models/category.schema";
import { CategoryFactory } from "@/modules/categories/infra/factories/category.factory";

export async function getArchivedCategoriesAction(): Promise<
  Result<ArchivedCategoryGroup[]>
> {
  const session = await SessionHandler.getSession();
  if (!session) {
    return failure("Não autenticado");
  }

  const useCase = CategoryFactory.makeGetArchivedCategoriesUseCase();
  return await useCase.execute({ session });
}

