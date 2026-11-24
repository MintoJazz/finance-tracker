import z from "zod";
import {
    CategoryClassificationBaseSchema,
    looseCategoryDrafts,
    refineClassification,
} from "@/modules/categories/models/category-classification.schema";
import { InstallmentTypeSchema } from "./installment-item.schema";

export const MIN_INSTALLMENTS = 2;
export const MAX_INSTALLMENTS = 120;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * A classificação (categoria/subcategoria, existente ou nova) é idêntica à de
 * recorrências, então o schema e a regra de exclusividade são reaproveitados.
 */
export const InstallmentFormBaseSchema = z.object({
    type: InstallmentTypeSchema,
    name: z
        .string({ message: "Informe o nome do parcelamento" })
        .trim()
        .min(1, "O nome do parcelamento é obrigatório")
        .max(100, "O nome deve ter no máximo 100 caracteres"),
    /** Valor total da compra, em centavos. */
    totalAmount: z
        .number({ message: "Informe o valor total" })
        .int("O valor deve ser em centavos")
        .positive("O valor total deve ser maior que zero"),
    totalInstallments: z
        .number({ message: "Informe o número de parcelas" })
        .int("O número de parcelas deve ser inteiro")
        .min(MIN_INSTALLMENTS, `Mínimo de ${MIN_INSTALLMENTS} parcelas`)
        .max(MAX_INSTALLMENTS, `Máximo de ${MAX_INSTALLMENTS} parcelas`),
    /** Fatura: data da compra. Mês a mês: vencimento da 1ª parcela (YYYY-MM-DD). */
    purchaseDate: z
        .string({ message: "Informe a data" })
        .regex(ISO_DATE, "Informe uma data válida"),
    /** Obrigatório apenas quando `type` é `INVOICE`. */
    cardId: z.number().int().positive().nullable().optional(),

    ...CategoryClassificationBaseSchema.shape,
});

export type InstallmentFormValues = z.infer<typeof InstallmentFormBaseSchema>;

type PaymentData = Pick<InstallmentFormValues, "type" | "cardId">;

export function refineInstallmentPayment(data: PaymentData, ctx: z.RefinementCtx) {
    if (data.type === "INVOICE" && data.cardId == null) {
        ctx.addIssue({
            code: "custom",
            path: ["cardId"],
            message: "Selecione o cartão da fatura",
        });
    }
}

export const InstallmentFormSchema = InstallmentFormBaseSchema.superRefine(
    (data, ctx) => {
        refineInstallmentPayment(data, ctx);
        refineClassification(data, ctx);
    }
);

/* ---------------------------- Passos do wizard ---------------------------- */

/** Desktop: tudo numa tela, exceto o nome dos rascunhos. */
export const InstallmentMainStepSchema = InstallmentFormBaseSchema.extend(
    looseCategoryDrafts
).superRefine((data, ctx) => {
    refineInstallmentPayment(data, ctx);
    refineClassification(data, ctx);
});

export const InstallmentBasicsStepSchema = InstallmentFormBaseSchema.pick({
    type: true,
    name: true,
});

export const InstallmentValuesStepSchema = InstallmentFormBaseSchema.pick({
    totalAmount: true,
    totalInstallments: true,
});

export const InstallmentDateStepSchema = InstallmentFormBaseSchema.pick({
    purchaseDate: true,
});

/** Passo dinâmico do cartão no mobile (exibido apenas quando `type` é `INVOICE`). */
export const InstallmentCardStepSchema = InstallmentFormBaseSchema.pick({
    cardId: true,
}).superRefine((data, ctx) => {
    if (data.cardId == null) {
        ctx.addIssue({
            code: "custom",
            path: ["cardId"],
            message: "Selecione o cartão da fatura",
        });
    }
});
