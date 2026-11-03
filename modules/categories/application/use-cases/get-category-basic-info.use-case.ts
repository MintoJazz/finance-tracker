import { endOfMonth, startOfMonth } from "date-fns";
import type { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import type { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import type { CategoryBasicInfoDTO } from "@/modules/categories/models/category-tab.schema";
import { failure, success, type Result } from "@/types/result.types";
import type { ICategoryQueries } from "../interfaces/category-queries.interface";

export interface GetCategoryBasicInfoUseCaseDTO {
  session: SessionPayload;
  id?: number | string | null;
  from?: Date;
  to?: Date;
}

export class GetCategoryBasicInfoUseCase {
  constructor(
    private readonly categoryQueries: ICategoryQueries,
    private readonly getSpaceAccess: ISpaceAccessProvider
  ) {}

  async execute({
    session,
    id,
    from,
    to,
  }: GetCategoryBasicInfoUseCaseDTO): Promise<Result<CategoryBasicInfoDTO>> {
    try {
      const { success: accessSuccess, data, error } =
        await this.getSpaceAccess.execute(session);
      if (!accessSuccess) {
        return failure(error ?? "Acesso negado ao contexto financeiro");
      }

      if (!data.canViewBalances) {
        return failure(
          "Sem permissão para visualizar as categorias deste contexto!"
        );
      }

      const now = new Date();
      const period = {
        from: from ?? startOfMonth(now),
        to: to ?? endOfMonth(now),
      };

      // Se nenhum id foi fornecido, estamos na Visão Geral
      if (!id) {
        return success({
          scope: "OVERVIEW",
          id: null,
          name: "Visão Geral de Categorias",
          period,
          availableTabs: ["OVERVIEW_INDICATORS"],
          defaultTab: "INDICATORS",
        });
      }

      const categoryId = Number(id);
      if (!Number.isInteger(categoryId) || categoryId <= 0) {
        return failure("Identificador de categoria inválido.");
      }

      const found = await this.categoryQueries.findCategoryById(
        session.contextId,
        categoryId
      );

      if (!found) {
        return failure("Categoria não encontrada.");
      }

      const isRoot = !found.parentId || found.childrenCount > 0;

      if (isRoot) {
        return success({
          scope: "ROOT",
          id: found.id,
          name: found.name,
          icon: found.icon ?? null,
          color: found.color ?? null,
          appearance: { icon: found.icon ?? null, color: found.color ?? null },
          parentId: found.parentId ?? null,
          period,
          availableTabs: ["ROOT_INDICATORS", "ROOT_ENTRIES", "CHILDREN"],
          defaultTab: "INDICATORS",
        });
      }

      return success({
        scope: "LEAF",
        id: found.id,
        name: found.name,
        icon: found.icon ?? null,
        color: found.color ?? null,
        appearance: { icon: found.icon ?? null, color: found.color ?? null },
        parentId: found.parentId ?? null,
        parentName: found.parentName ?? null,
        period,
        availableTabs: ["LEAF_INDICATORS", "LEAF_ENTRIES"],
        defaultTab: "INDICATORS",
      });
    } catch (err) {
      console.error("[GetCategoryBasicInfoUseCase] Erro inesperado:", err);
      return failure("Ocorreu um erro interno ao carregar os dados da categoria.");
    }
  }
}

