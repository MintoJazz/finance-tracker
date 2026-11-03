import { endOfMonth, startOfMonth } from "date-fns";
import type { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import type { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import type {
  CategoryTreeDTO,
  CategoryTreeFilter,
} from "@/modules/categories/models/category.schema";
import { failure, success, type Result } from "@/types/result.types";
import type { ICategoryQueries } from "../interfaces/category-queries.interface";

export interface GetCategoriesTreeUseCaseDTO {
  session: SessionPayload;
  filter?: CategoryTreeFilter;
}

export class GetCategoriesTreeUseCase {
  constructor(
    private readonly categoryQueries: ICategoryQueries,
    private readonly getSpaceAccess: ISpaceAccessProvider
  ) {}

  async execute({
    session,
    filter,
  }: GetCategoriesTreeUseCaseDTO): Promise<Result<CategoryTreeDTO>> {
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
        from: filter?.from ?? startOfMonth(now),
        to: filter?.to ?? endOfMonth(now),
      };

      const pageRequest = filter?.pageRequest ?? { page: 1, pageSize: 6 };

      const page = await this.categoryQueries.listRootCategories(
        session.contextId,
        pageRequest,
        { search: filter?.search }
      );

      return success({
        period,
        totalAmount: 0,
        page,
        items: page.data,
      });
    } catch (err) {
      console.error("[GetCategoriesTreeUseCase] Erro inesperado:", err);
      return failure("Ocorreu um erro interno ao carregar a árvore de categorias.");
    }
  }
}

