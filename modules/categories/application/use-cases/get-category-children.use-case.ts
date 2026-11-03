import type { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import type { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import type { CategoryItem } from "@/modules/categories/models/category.schema";
import { failure, success, type Result } from "@/types/result.types";
import type { ICategoryQueries } from "../interfaces/category-queries.interface";

export interface GetCategoryChildrenUseCaseDTO {
  session: SessionPayload;
  parentId: number;
}

export class GetCategoryChildrenUseCase {
  constructor(
    private readonly categoryQueries: ICategoryQueries,
    private readonly getSpaceAccess: ISpaceAccessProvider
  ) {}

  async execute({
    session,
    parentId,
  }: GetCategoryChildrenUseCaseDTO): Promise<Result<CategoryItem[]>> {
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

      const children = await this.categoryQueries.listCategoryChildren(
        session.contextId,
        parentId
      );

      return success(children);
    } catch (err) {
      console.error("[GetCategoryChildrenUseCase] Erro inesperado:", err);
      return failure("Ocorreu um erro interno ao carregar as subcategorias.");
    }
  }
}

