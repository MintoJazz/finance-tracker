import type { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import type { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import type { ArchivedCategoryGroup } from "@/modules/categories/models/category.schema";
import { failure, success, type Result } from "@/types/result.types";
import type { ICategoryQueries } from "../interfaces/category-queries.interface";

export interface GetArchivedCategoriesUseCaseDTO {
  session: SessionPayload;
}

export class GetArchivedCategoriesUseCase {
  constructor(
    private readonly categoryQueries: ICategoryQueries,
    private readonly getSpaceAccess: ISpaceAccessProvider
  ) {}

  async execute({
    session,
  }: GetArchivedCategoriesUseCaseDTO): Promise<Result<ArchivedCategoryGroup[]>> {
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

      const groups = await this.categoryQueries.listArchivedCategories(
        session.contextId
      );

      return success(groups);
    } catch (err) {
      console.error("[GetArchivedCategoriesUseCase] Erro inesperado:", err);
      return failure("Ocorreu um erro interno ao carregar as categorias arquivadas.");
    }
  }
}

