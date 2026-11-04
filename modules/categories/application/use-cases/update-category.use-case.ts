import type { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import type { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import type {
  CategoryItem,
  UpdateCategoryInput,
} from "@/modules/categories/models/category.schema";
import { failure, success, type Result } from "@/types/result.types";
import type { ICategoryRepository } from "../interfaces/category-repository.interface";
import { CategoryDomainError, CategoryPolicy } from "../policies/category.policy";

export interface UpdateCategoryUseCaseDTO {
  session: SessionPayload;
  data: UpdateCategoryInput;
}

export class UpdateCategoryUseCase {
  constructor(
    private readonly categoryRepository: ICategoryRepository,
    private readonly getSpaceAccess: ISpaceAccessProvider
  ) {}

  async execute({
    session,
    data,
  }: UpdateCategoryUseCaseDTO): Promise<Result<CategoryItem>> {
    try {
      const { success: accessSuccess, data: accessData, error } =
        await this.getSpaceAccess.execute(session);
      if (!accessSuccess) {
        return failure(error ?? "Acesso negado ao contexto financeiro");
      }

      if (!accessData.canManageBalances) {
        return failure(
          "Sem permissão para gerenciar as categorias deste contexto!"
        );
      }

      const existing = await this.categoryRepository.findByIdAndContextId(
        data.id,
        session.contextId
      );

      if (!existing) {
        return failure("Categoria não encontrada.");
      }

      if (existing.isArchived) {
        return failure("Não é possível editar uma categoria arquivada.");
      }

      CategoryPolicy.validateCanUpdateCategory(existing, data);

      const updated = await this.categoryRepository.update(
        session.contextId,
        data
      );

      return success(updated);
    } catch (err) {
      if (err instanceof CategoryDomainError) {
        return failure(err.message);
      }
      console.error("[UpdateCategoryUseCase] Erro inesperado:", err);
      return failure("Ocorreu um erro interno ao atualizar a categoria.");
    }
  }
}
