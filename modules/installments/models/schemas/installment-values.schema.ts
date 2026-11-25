import { z } from "zod";
import { MAX_INSTALLMENTS } from "./installment-form.schema";

/** Modo de edição ativa no formulário unificado de Valores e Parcelas. */
export const InstallmentValuesEditModeSchema = z.enum([
    "INSTALLMENT_AMOUNT",
    "TOTAL_AMOUNT",
]);

/**
 * Fluxo exclusivo de Valores e Parcelas (reconciliação de valor e quantidade total `N`).
 * Não contém campos de data, dia de vencimento ou deslocamento de fatura.
 */
export const AdjustInstallmentValuesSchema = z.object({
    totalInstallments: z
        .number({ message: "Informe a quantidade de parcelas" })
        .int("A quantidade de parcelas deve ser inteira")
        .min(1, "Informe pelo menos 1 parcela")
        .max(MAX_INSTALLMENTS, `Máximo de ${MAX_INSTALLMENTS} parcelas`),
    editMode: InstallmentValuesEditModeSchema,
    /** Valor de cada parcela em aberto, em centavos. */
    installmentAmount: z
        .number({ message: "Informe o valor da parcela" })
        .int("O valor deve ser em centavos")
        .positive("O valor da parcela deve ser maior que zero"),
    /** Valor total resultante do parcelamento (consolidadas + em aberto), em centavos. */
    totalAmount: z
        .number({ message: "Informe o valor total" })
        .int("O valor deve ser em centavos")
        .positive("O valor total deve ser maior que zero"),
});

export type InstallmentValuesEditMode = z.infer<
    typeof InstallmentValuesEditModeSchema
>;
export type AdjustInstallmentValuesValues = z.infer<
    typeof AdjustInstallmentValuesSchema
>;
