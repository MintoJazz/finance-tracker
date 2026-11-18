import { z } from "zod";

export const RecurrenceFrequencySchema = z.enum(["WEEKLY", "MONTHLY", "YEARLY"]);
export const RecurrenceStatusSchema = z.enum(["ALL", "ACTIVE", "OVERDUE", "INACTIVE"]);
export const RecurrenceItemStatusSchema = z.enum(["ACTIVE", "OVERDUE", "INACTIVE"]);
export const RecurrenceDerivedStatusSchema = RecurrenceItemStatusSchema;
export const RecurrenceDirectionSchema = z.enum(["CREDIT", "DEBIT"]);

export const RecurrenceCategorySchema = z.object({
    balanceId: z.number().int().positive(),
    name: z.string().min(1),
    color: z.string().nullable(),
    /** Categoria raiz (pai da subcategoria); `balanceId`/`name` acima são da subcategoria. */
    parentId: z.number().int().positive().nullable().optional(),
    parentName: z.string().nullable().optional(),
});

export const RecurrenceListItemSchema = z.object({
    balanceId: z.number().int().positive(),
    name: z.string().min(1),
    direction: RecurrenceDirectionSchema,
    frequency: RecurrenceFrequencySchema,
    interval: z.number().int().positive(),
    dueDay: z.number().int().min(0).max(31),
    dueMonth: z.number().int().min(1).max(12).nullable(),
    closingDay: z.number().int().min(0).max(31).nullable().optional(),
    closingMonth: z.number().int().min(1).max(12).nullable().optional(),
    currentAmount: z.number().int().nonnegative(),
    nextDueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
    isActive: z.boolean(),
    isOverdue: z.boolean(),
    /** Arquivada (Balance.removedAt != null). */
    isArchived: z.boolean().default(false),
    status: RecurrenceItemStatusSchema.optional(),
    category: RecurrenceCategorySchema.nullable(),
    icon: z.string().nullable(),
    color: z.string().nullable(),
    startsAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    endsAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
});

export const RecurrenceFiltersSchema = z.object({
    q: z.string().optional(),
    direction: RecurrenceDirectionSchema.optional(),
    active: RecurrenceStatusSchema.default("ALL"),
    frequency: RecurrenceFrequencySchema.optional(),
    /** Lista somente as arquivadas (em vez de somente as não arquivadas). */
    archivedOnly: z.boolean().optional(),
});

export type RecurrenceFrequency = z.infer<typeof RecurrenceFrequencySchema>;
export type RecurrenceStatus = z.infer<typeof RecurrenceStatusSchema>;
export type RecurrenceItemStatus = z.infer<typeof RecurrenceItemStatusSchema>;
export type RecurrenceDerivedStatus = RecurrenceItemStatus;
export type RecurrenceDirection = z.infer<typeof RecurrenceDirectionSchema>;
export type RecurrenceCategory = z.infer<typeof RecurrenceCategorySchema>;
export type RecurrenceListItem = z.infer<typeof RecurrenceListItemSchema>;

export type RecurrenceFilters = z.infer<typeof RecurrenceFiltersSchema>;
export type RecurrenceFiltersInput = z.input<typeof RecurrenceFiltersSchema>;

/**
 * Resolve o status de uma recorrência com base no seu estado de atividade e vencimento.
 */
export function getRecurrenceStatus(
    item: Pick<RecurrenceListItem, "isActive" | "isOverdue"> & {
        status?: RecurrenceItemStatus;
    }
): RecurrenceItemStatus {
    if (item.status) {
        return item.status;
    }
    if (!item.isActive) {
        return "INACTIVE";
    }
    if (item.isOverdue) {
        return "OVERDUE";
    }
    return "ACTIVE";
}