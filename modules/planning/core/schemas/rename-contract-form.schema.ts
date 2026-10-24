import { z } from "zod";

export const RenameContractFormSchema = z.object({
  name: z.string().min(1, "Informe o nome do contrato").max(120, "Nome muito longo"),
});

export type RenameContractFormValues = z.infer<typeof RenameContractFormSchema>;

export const DEFAULT_RENAME_CONTRACT_FORM_VALUES: RenameContractFormValues = {
  name: "",
};
