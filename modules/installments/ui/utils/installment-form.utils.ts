import { addMonths } from "date-fns";
import {
    fromDateString,
    toDateString,
} from "@/modules/agreements/ui/utils/date-string";
import type { InstallmentFormValues } from "@/modules/installments/models/schemas/installment-form.schema";

export { fromDateString, toDateString };

export function getInstallmentFormDefaults(
    overrides?: Partial<InstallmentFormValues>
): InstallmentFormValues {
    return {
        type: "INVOICE",
        name: "",
        totalAmount: 0,
        totalInstallments: 12,
        purchaseDate: toDateString(new Date()) as string,
        cardId: null,
        categoryId: null,
        newCategory: null,
        subcategoryId: null,
        newSubcategory: null,
        ...overrides,
    };
}

/** Valor aproximado de cada parcela, em centavos (a última absorve a diferença). */
export function computeInstallmentAmount(
    totalAmount: number | undefined,
    totalInstallments: number | undefined
): number {
    if (!totalAmount || !totalInstallments || totalInstallments < 1) return 0;
    return Math.ceil(totalAmount / totalInstallments);
}

/** Data (YYYY-MM-DD) da última parcela, contando mês a mês a partir da primeira. */
export function computeLastInstallmentDate(
    purchaseDate: string | undefined,
    totalInstallments: number | undefined
): string | null {
    const start = fromDateString(purchaseDate);
    if (!start || !totalInstallments || totalInstallments < 1) return null;
    return toDateString(addMonths(start, totalInstallments - 1));
}
