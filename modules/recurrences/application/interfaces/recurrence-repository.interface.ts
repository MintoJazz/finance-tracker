import type {
    RecurrenceFormFrequency,
    RecurrenceFormValues,
} from "@/modules/recurrences/models/schemas/recurrence-form.schema";

export interface CreateRecurrenceRepositoryDTO {
    contextId: number;
    direction: RecurrenceFormValues["direction"];
    name: string;
    /** Valor inicial em centavos */
    amount: number;
    frequency: RecurrenceFormFrequency;
    /** Início da recorrência (YYYY-MM-DD) */
    startDate: string;
    hasCustomClosingDate: boolean;
    dueDay: number;
    closingDay?: number | null;
    dueMonth?: number | null;
    closingMonth?: number | null;
    /** Subcategoria padrão (Balance.parentId) */
    subcategoryId: number;
}

export interface IRecurrenceRepository {
    create(data: CreateRecurrenceRepositoryDTO): Promise<{ id: number; name: string }>;
}
