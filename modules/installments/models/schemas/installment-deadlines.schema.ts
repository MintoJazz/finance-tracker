import { z } from "zod";

/**
 * Fluxo exclusivo de Prazos — Mês a Mês: altera apenas o dia de vencimento das parcelas em aberto.
 * Não contém campos de valor nem quantidade de parcelas.
 */
export const AdjustMonthlyDueDaySchema = z.object({
    dueDay: z
        .number({ message: "Informe o dia de vencimento" })
        .int("O dia de vencimento deve ser inteiro")
        .min(1, "O dia deve estar entre 1 e 31")
        .max(31, "O dia deve estar entre 1 e 31"),
});

export type AdjustMonthlyDueDayValues = z.infer<
    typeof AdjustMonthlyDueDaySchema
>;
