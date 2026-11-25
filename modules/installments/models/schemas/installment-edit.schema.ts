import { z } from "zod";

/**
 * Edição cadastral do parcelamento: restrita exclusivamente ao Nome.
 * Parcelamentos não possuem `BalanceAppearance` (ícone/cor são herdados da `CATEGORY`).
 */
export const UpdateInstallmentNameSchema = z.object({
    name: z
        .string({ message: "Informe o nome do parcelamento" })
        .trim()
        .min(1, "O nome do parcelamento é obrigatório")
        .max(100, "O nome deve ter no máximo 100 caracteres"),
    /** Opcionalmente sincroniza `Entry.description` nas parcelas existentes. */
    syncEntryDescriptions: z.boolean().default(true),
});

export type UpdateInstallmentNameInput = z.input<typeof UpdateInstallmentNameSchema>;
export type UpdateInstallmentNameValues = z.infer<typeof UpdateInstallmentNameSchema>;
