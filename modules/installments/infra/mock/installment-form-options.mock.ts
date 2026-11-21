import type { InstallmentFormOptions } from "@/modules/installments/models/schemas/installment-form-options.schema";
import { MOCK_RECURRENCE_CATEGORY_OPTIONS } from "@/modules/recurrences/infra/mock/recurrence-category-options.mock";
import { MOCK_INSTALLMENT_CARDS } from "./installments.mock";

export type { InstallmentFormOptions };

/**
 * Opções do formulário de parcelamento (mock).
 * Provisório até existir o use-case de opções; os ids não existem no banco.
 */
export const MOCK_INSTALLMENT_FORM_OPTIONS: InstallmentFormOptions = {
    ...MOCK_RECURRENCE_CATEGORY_OPTIONS,
    cards: MOCK_INSTALLMENT_CARDS,
};
