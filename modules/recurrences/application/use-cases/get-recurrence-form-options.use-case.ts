import type { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import type { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import type { ICategoryQueries } from "@/modules/categories/application/interfaces/category-queries.interface";
import type { RecurrenceCategoryOptions } from "@/modules/recurrences/models/schemas/recurrence-form-options.schema";
import { failure, success, type Result } from "@/types/result.types";

export interface GetRecurrenceFormOptionsUseCaseDTO {
    session: SessionPayload;
}

export class GetRecurrenceFormOptionsUseCase {
    constructor(
        private readonly categoryQueries: ICategoryQueries,
        private readonly getSpaceAccess: ISpaceAccessProvider
    ) {}

    async execute({
        session,
    }: GetRecurrenceFormOptionsUseCaseDTO): Promise<Result<RecurrenceCategoryOptions>> {
        try {
            const { success: accessSuccess, data, error } =
                await this.getSpaceAccess.execute(session);
            if (!accessSuccess) {
                return failure(error ?? "Acesso negado ao contexto financeiro");
            }
            if (!data.canViewBalances) {
                return failure("Sem permissão para visualizar as categorias deste contexto!");
            }

            const [categories, subcategories] = await Promise.all([
                this.categoryQueries.listActiveCategoryOptions(session.contextId),
                this.categoryQueries.listActiveSubcategoryOptions(session.contextId),
            ]);

            return success({ categories, subcategories });
        } catch (err) {
            console.error("[GetRecurrenceFormOptionsUseCase] Erro inesperado:", err);
            return failure("Ocorreu um erro interno ao carregar as categorias.");
        }
    }
}
