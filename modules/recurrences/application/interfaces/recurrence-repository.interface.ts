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

export interface RecurrenceStatusRecord {
    id: number;
    name: string;
    isArchived: boolean;
    isActive: boolean;
}

export interface IRecurrenceRepository {
    create(data: CreateRecurrenceRepositoryDTO): Promise<{ id: number; name: string }>;
    findByIdAndContextId(
        id: number,
        contextId: number
    ): Promise<RecurrenceStatusRecord | null>;
    update(
        id: number,
        contextId: number,
        data: { name: string; subcategoryId: number }
    ): Promise<{ id: number; name: string }>;
    archive(id: number, contextId: number): Promise<{ id: number; name: string }>;
    setActive(
        id: number,
        contextId: number,
        isActive: boolean
    ): Promise<{ id: number; name: string; isActive: boolean }>;
}
