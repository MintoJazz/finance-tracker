import type { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import type { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import type {
  CategoryItem,
  CreateCategoryFormValues,
} from "@/modules/categories/models/category.schema";
import { failure, success, type Result } from "@/types/result.types";
import type { ICategoryRepository } from "../interfaces/category-repository.interface";
import { CategoryDomainError } from "../policies/category.policy";

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

      const created = await this.categoryRepository.create(
        session.contextId,
        data
      );

      return success(created);
    } catch (err) {
      if (err instanceof CategoryDomainError) {
        return failure(err.message);
      }
      console.error("[CreateCategoryUseCase] Erro inesperado:", err);
      return failure("Ocorreu um erro interno ao criar a categoria.");
    }
  }
}
