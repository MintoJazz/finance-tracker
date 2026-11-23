import type { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import type { ICategoryQueries } from "@/modules/categories/application/interfaces/category-queries.interface";
import type { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import type { InstallmentFormOptions } from "@/modules/installments/models/schemas/installment-form-options.schema";
import { failure, success, type Result } from "@/types/result.types";
import type { IInstallmentQueries } from "../interfaces/installment-queries.interface";

export interface GetInstallmentFormOptionsUseCaseDTO {
    session: SessionPayload;
}

export class GetInstallmentFormOptionsUseCase {
    constructor(
        private readonly categoryQueries: ICategoryQueries,
        private readonly installmentQueries: IInstallmentQueries,
        private readonly getSpaceAccess: ISpaceAccessProvider
    ) {}

    async execute({
        session,
    }: GetInstallmentFormOptionsUseCaseDTO): Promise<Result<InstallmentFormOptions>> {
        try {
            const {
                success: accessSuccess,
                data: accessData,
                error,
            } = await this.getSpaceAccess.execute(session);

            if (!accessSuccess || !accessData) {
                return failure(error ?? "Acesso negado ao contexto financeiro");
            }

            if (!accessData.canViewBalances) {
                return failure(
                    "Sem permissão para visualizar as opções deste contexto!"
                );
            }

            const [categories, subcategories, cards] = await Promise.all([
                this.categoryQueries.listActiveCategoryOptions(session.contextId),
                this.categoryQueries.listActiveSubcategoryOptions(session.contextId),
                this.installmentQueries.listCardOptions(session.contextId),
            ]);

            return success({ categories, subcategories, cards });
        } catch (err) {
            console.error("[GetInstallmentFormOptionsUseCase] Falha crítica:", err);
            return failure("Ocorreu um erro interno ao carregar as opções do formulário.");
        }
    }
}
