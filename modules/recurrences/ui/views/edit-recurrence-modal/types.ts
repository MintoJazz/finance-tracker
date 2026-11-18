import type { RecurrenceFormValues } from "@/modules/recurrences/models/schemas/recurrence-form.schema";
import type { RecurrenceCategoryOptions } from "@/modules/recurrences/infra/mock/recurrence-category-options.mock";

export interface EditRecurrenceModalInput {
    balanceId: number;
    name: string;
    /** Categoria raiz atual (pai da subcategoria) */
    categoryId: number | null;
    /** Subcategoria atual (categoria padrão da recorrência) */
    subcategoryId: number | null;
    options: RecurrenceCategoryOptions;
}

export interface EditRecurrenceModalProps {
    isOpen: boolean;
    options: RecurrenceCategoryOptions;
    initialData: RecurrenceFormValues;
    onSubmit: (data: RecurrenceFormValues) => Promise<void>;
    onClose: () => void;
    onOpenChangeComplete?: (open: boolean) => void;
}
