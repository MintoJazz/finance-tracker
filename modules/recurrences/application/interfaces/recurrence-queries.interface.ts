import type {
    RecurrenceFilters,
    RecurrenceListItem,
} from "../../models/schemas/recurrence-item.schema";

export interface IRecurrenceQueries {
    /**
     * Lista todas as recorrências contínuas (perpétuas, onde endsAt === null) de um contexto financeiro,
     * excluindo parcelamentos/acordos a termo, com filtros opcionais.
     */
    listRecurrencesByContextId(
        contextId: number,
        filter?: RecurrenceFilters
    ): Promise<RecurrenceListItem[]>;

    /**
     * Busca uma recorrência específica pelo seu balanceId e contextId.
     */
    findRecurrenceById(
        balanceId: number,
        contextId: number
    ): Promise<RecurrenceListItem | null>;
}

