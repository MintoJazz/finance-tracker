"use server";

import { revalidatePath } from "next/cache";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { failure, success, type Result } from "@/types/result.types";
import {
  CreateCategorySchema,
  type CreateCategoryFormValues,
  type CategoryItem,
} from "@/modules/categories/models/category.schema";
import { CategoriesMockService } from "@/modules/categories/infra/mock/categories.mock";

export async function createCategoryAction(
  formData: CreateCategoryFormValues
): Promise<Result<CategoryItem>> {
  const session = await SessionHandler.getSession();
  if (!session) {
    return failure("Não autenticado");
  }

  const parsed = CreateCategorySchema.safeParse(formData);
  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Dados inválidos");
  }

  try {
    const created = CategoriesMockService.createCategory(parsed.data);
    revalidatePath("/categories", "layout");
    return success(created);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Não foi possível criar a categoria.";
    return failure(message);
  }
}

