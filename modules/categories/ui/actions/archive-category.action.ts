"use server";

import { revalidatePath } from "next/cache";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { failure, type Result } from "@/types/result.types";
import {
  ArchiveCategorySchema,
  type ArchiveCategoryInput,
  type ArchiveCategoryResult,
} from "@/modules/categories/models/category.schema";
import { CategoryFactory } from "@/modules/categories/infra/factories/category.factory";

export async function archiveCategoryAction(
  input: ArchiveCategoryInput
): Promise<Result<ArchiveCategoryResult>> {
  const session = await SessionHandler.getSession();
  if (!session) {
    return failure("Não autenticado");
  }

  const parsed = ArchiveCategorySchema.safeParse(input);
  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Dados inválidos");
  }

  const useCase = CategoryFactory.makeArchiveCategoryUseCase();
  const result = await useCase.execute({
    session,
    data: parsed.data,
  });

  if (result.success) {
    revalidatePath("/categories", "layout");
  }

  return result;
}

