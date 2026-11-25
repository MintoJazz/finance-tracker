import { z } from "zod";

/** Troca de cartão: exclusivo para parcelamentos Em Fatura (`INVOICE`). */
export const ChangeInstallmentCardSchema = z.object({
    cardId: z
        .number({ message: "Selecione o novo cartão" })
        .int("Cartão inválido")
        .positive("Selecione o novo cartão"),
});

export type ChangeInstallmentCardValues = z.infer<
    typeof ChangeInstallmentCardSchema
>;
