"use server";

import { revalidatePath } from "next/cache";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { failure, type Result } from "@/types/result.types";
import {
  UpdateCategorySchema,
  type UpdateCategoryInput,
  type CategoryItem,
} from "@/modules/categories/models/category.schema";
import { CategoryFactory } from "@/modules/categories/infra/factories/category.factory";

export async function updateCategoryAction(
  formData: UpdateCategoryInput
): Promise<Result<CategoryItem>> {
  const session = await SessionHandler.getSession();
  if (!session) {
    return failure("Não autenticado");
  }

  const parsed = UpdateCategorySchema.safeParse(formData);
  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Dados inválidos");
  }

  try {
    const useCase = CategoryFactory.makeUpdateCategoryUseCase();
    const result = await useCase.execute({
      session,
      data: parsed.data,
    });

    if (result.success) {
      revalidatePath("/categories", "layout");
      revalidatePath(`/categories/${parsed.data.id}`);
    }

    return result;
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Não foi possível atualizar a categoria.";
    return failure(message);
  }
}

