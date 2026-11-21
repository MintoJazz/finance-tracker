import type { FormFieldItem, FormFieldRow } from "@/types/form.types";
import type { InstallmentFormValues } from "@/modules/installments/models/schemas/installment-form.schema";
import type { InstallmentFormOptions } from "@/modules/installments/models/schemas/installment-form-options.schema";
import {
    createCategoryPickerField,
    createClassificationRow,
    createNewCategoryField,
    createNewSubcategoryField,
    createSubcategoryPickerField,
} from "@/modules/recurrences/ui/components/recurrence-form/classification-fields";
import { ROW_CLASS } from "./fields";

/**
 * A classificação é a mesma de recorrências (mesmos quatro campos no form),
 * então os campos e controles são reaproveitados. Só o tipo do form muda.
 */
type Item = FormFieldItem<InstallmentFormValues>;
type Row = FormFieldRow<InstallmentFormValues>;

/** Mesma grade (2 colunas iguais, mesmo gap) das demais linhas. */
export const installmentClassificationRow = (o: InstallmentFormOptions): Row => ({
    ...(createClassificationRow(o) as unknown as Row),
    className: ROW_CLASS,
});
export const installmentCategoryPickerField = (o: InstallmentFormOptions) =>
    createCategoryPickerField(o) as unknown as Item;
export const installmentSubcategoryPickerField = (o: InstallmentFormOptions) =>
    createSubcategoryPickerField(o) as unknown as Item;
export const installmentNewCategoryField = () =>
    createNewCategoryField() as unknown as Item;
export const installmentNewSubcategoryField = (o: InstallmentFormOptions) =>
    createNewSubcategoryField(o) as unknown as Item;
