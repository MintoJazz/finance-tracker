import { Input } from "@/components/ui/input";
import type { FormField } from "@/types/form.types";
import type { RenameContractFormValues } from "../../../../core/schemas/rename-contract-form.schema";

export const renameContractFields: FormField<RenameContractFormValues>[] = [
  {
    name: "name",
    label: "Nome do contrato",
    children: (
      <Input
        placeholder="Digite o nome do contrato"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        autoFocus
      />
    ),
  },
];
