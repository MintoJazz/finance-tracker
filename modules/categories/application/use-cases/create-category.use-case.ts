import type { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import type { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import type {
  CategoryItem,
  CreateCategoryFormValues,
} from "@/modules/categories/models/category.schema";
import { failure, success, type Result } from "@/types/result.types";
import type { ICategoryRepository } from "../interfaces/category-repository.interface";

export interface CreateCategoryUseCaseDTO {
  session: SessionPayload;
  data: CreateCategoryFormValues;
}

export class CreateCategoryUseCase {
  constructor(
    private readonly categoryRepository: ICategoryRepository,
    private readonly getSpaceAccess: ISpaceAccessProvider
  ) {}

  async execute({
    session,
    data,
  }: CreateCategoryUseCaseDTO): Promise<Result<CategoryItem>> {
    try {
      const { success: accessSuccess, data: accessData, error } =
        await this.getSpaceAccess.execute(session);
      if (!accessSuccess) {
        return failure(error ?? "Acesso negado ao contexto financeiro");
      }

      if (!accessData.canManageBalances) {
        return failure(
          "Sem permissão para criar categorias neste contexto!"
        );
      }

      if (data.parentId) {
        const parent = await this.categoryRepository.findParentCategory(
          session.contextId,
          data.parentId
        );

        if (!parent) {
          return failure("Categoria pai não encontrada no contexto atual.");
        }

        // Regra de profundidade de 2 níveis: categorias raiz possuem parentId === null.
        // Se a categoria indicada já possuir um parentId, rejeitamos a operação.
        if (parent.parentId !== null) {
          return failure(
            "Não é permitido criar subcategorias dentro de outra subcategoria."
          );
        }
      }

      const created = await this.categoryRepository.create(
        session.contextId,
        data
      );

      return success(created);
    } catch (err) {
      console.error("[CreateCategoryUseCase] Erro inesperado:", err);
      return failure("Ocorreu um erro interno ao criar a categoria.");
    }
  }
}

