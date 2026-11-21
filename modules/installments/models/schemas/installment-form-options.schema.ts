import type { RecurrenceCategoryOptions } from "@/modules/recurrences/models/schemas/recurrence-form-options.schema";
import type { InstallmentCard } from "./installment-item.schema";

/** Opções do formulário de parcelamento: categorias/subcategorias (como em recorrências) e cartões. */
export interface InstallmentFormOptions extends RecurrenceCategoryOptions {
    cards: InstallmentCard[];
}
