import { addMonths } from "date-fns";
import {
    fromDateString,
    toDateString,
} from "@/modules/agreements/ui/utils/date-string";
import { splitInstallmentAmounts } from "@/modules/installments/application/services/installment-schedule.calculator";
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

/** Enquanto o usuário digita, total e parcelas podem estar vazios ou fracionados: não divide nesses casos. */
function isValidSplit(
    totalAmount: number | undefined,
    totalInstallments: number | undefined
): totalAmount is number {
    return (
        Number.isInteger(totalAmount) &&
        (totalAmount as number) > 0 &&
        Number.isInteger(totalInstallments) &&
        (totalInstallments as number) >= 1
    );
}

/** Valor das parcelas 1..N-1, em centavos (a última absorve o resto da divisão). */
export function computeInstallmentAmount(
    totalAmount: number | undefined,
    totalInstallments: number | undefined
): number {
    if (!isValidSplit(totalAmount, totalInstallments)) return 0;
    return splitInstallmentAmounts(totalAmount, totalInstallments as number)[0];
}

/** Valor da última parcela, em centavos: a base mais o resto da divisão. */
export function computeLastInstallmentAmount(
    totalAmount: number | undefined,
    totalInstallments: number | undefined
): number {
    if (!isValidSplit(totalAmount, totalInstallments)) return 0;
    const amounts = splitInstallmentAmounts(totalAmount, totalInstallments as number);
    return amounts[amounts.length - 1];
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
