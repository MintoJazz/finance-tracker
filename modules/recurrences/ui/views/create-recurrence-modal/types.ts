import type { RecurrenceFormValues } from "@/modules/recurrences/models/schemas/recurrence-form.schema";
import type { RecurrenceCategoryOptions } from "@/modules/recurrences/infra/mock/recurrence-category-options.mock";

export interface CreateRecurrenceModalInput {
    options: RecurrenceCategoryOptions;
    defaultValues?: Partial<RecurrenceFormValues>;
}

export interface CreateRecurrenceModalProps {
    isOpen: boolean;
    options: RecurrenceCategoryOptions;
    initialData: RecurrenceFormValues;
    onSubmit: (data: RecurrenceFormValues) => Promise<void>;
    onClose: () => void;
    onOpenChangeComplete?: (open: boolean) => void;
}
