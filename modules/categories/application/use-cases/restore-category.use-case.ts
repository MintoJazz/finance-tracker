import type { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import type { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import type {
  RestoreCategoryInput,
  RestoreCategoryResult,
} from "@/modules/categories/models/category.schema";
import { failure, success, type Result } from "@/types/result.types";
import type { ICategoryRepository } from "../interfaces/category-repository.interface";
import { CategoryDomainError } from "../policies/category.policy";

export interface RestoreCategoryUseCaseDTO {
  session: SessionPayload;
  data: RestoreCategoryInput;
}

export class RestoreCategoryUseCase {
  constructor(
    private readonly categoryRepository: ICategoryRepository,
    private readonly getSpaceAccess: ISpaceAccessProvider
  ) {}

  async execute({
    session,
    data,
  }: RestoreCategoryUseCaseDTO): Promise<Result<RestoreCategoryResult>> {
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

      const result = await this.categoryRepository.restoreCategory(
        data.id,
        session.contextId
      );

      return success(result);
    } catch (err) {
      if (err instanceof CategoryDomainError) {
        return failure(err.message);
      }
      console.error("[RestoreCategoryUseCase] Erro inesperado:", err);
      return failure("Ocorreu um erro interno ao restaurar a categoria.");
    }
  }
}

