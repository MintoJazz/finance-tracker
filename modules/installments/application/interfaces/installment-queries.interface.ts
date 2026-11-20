import type {
    InstallmentFilters,
    InstallmentListItem,
} from "../../models/schemas/installment-item.schema";

export interface IInstallmentQueries {
    /** Lista os parcelamentos de um contexto financeiro, com filtros opcionais. */
    listInstallmentsByContextId(
        contextId: number,
        filter?: InstallmentFilters
    ): Promise<InstallmentListItem[]>;

    /** Busca um parcelamento pelo seu balanceId e contextId. */
    findInstallmentById(
        balanceId: number,
        contextId: number
    ): Promise<InstallmentListItem | null>;
}
