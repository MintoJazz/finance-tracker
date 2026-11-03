"use server";

import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { failure, success, type Result } from "@/types/result.types";
import { getCategoriesTreeAction } from "./get-categories-tree.action";
import { CategoriesMockService } from "@/modules/categories/infra/mock/categories.mock";
import {
  type CategoryBasicInfoDTO,
} from "@/modules/categories/models/category-tab.schema";

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

  const treeResult = await getCategoriesTreeAction({
    from: params?.from,
    to: params?.to,
  });

  if (!treeResult.success || !treeResult.data) {
    return failure(treeResult.error ?? "Erro ao carregar dados de categorias");
  }

  const period = treeResult.data.period;

  // Se nenhum id foi fornecido, estamos na Visão Geral
  if (!params?.id) {
    return success({
      scope: "OVERVIEW",
      id: null,
      name: "Visão Geral de Categorias",
      period,
      availableTabs: ["OVERVIEW_INDICATORS"],
      defaultTab: "INDICATORS",
    });
  }

  const categoryId = Number(params.id);
  const found = CategoriesMockService.findCategoryById(categoryId);

  if (!found) {
    return failure("Categoria não encontrada");
  }

  const { category, parent } = found;
  const isRoot = !category.parentId || category.childrenCount > 0;

  if (isRoot) {
    return success({
      scope: "ROOT",
      id: category.id,
      name: category.name,
      icon: category.icon,
      color: category.color,
      appearance: category.appearance,
      parentId: category.parentId ?? null,
      period,
      availableTabs: ["ROOT_INDICATORS", "ROOT_ENTRIES", "CHILDREN"],
      defaultTab: "INDICATORS",
    });
  }

  return success({
    scope: "LEAF",
    id: category.id,
    name: category.name,
    icon: category.icon,
    color: category.color,
    appearance: category.appearance,
    parentId: category.parentId ?? null,
    parentName: parent?.name ?? null,
    period,
    availableTabs: ["LEAF_INDICATORS", "LEAF_ENTRIES"],
    defaultTab: "INDICATORS",
  });
}
