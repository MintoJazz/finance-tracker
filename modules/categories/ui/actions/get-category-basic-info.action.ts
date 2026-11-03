"use server";

import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { failure, type Result } from "@/types/result.types";
import { CategoryFactory } from "@/modules/categories/infra/factories/category.factory";
import type { CategoryBasicInfoDTO } from "@/modules/categories/models/category-tab.schema";

export interface GetCategoryBasicInfoParams {
  id?: number | string | null;
  from?: Date;
  to?: Date;
}

export async function getCategoryBasicInfoAction(
  params?: GetCategoryBasicInfoParams
): Promise<Result<CategoryBasicInfoDTO>> {
  const session = await SessionHandler.getSession();
  if (!session) {
    return failure("Não autenticado");
  }

  const useCase = CategoryFactory.makeGetCategoryBasicInfoUseCase();
  return await useCase.execute({
    session,
    id: params?.id,
    from: params?.from,
    to: params?.to,
  });
}
