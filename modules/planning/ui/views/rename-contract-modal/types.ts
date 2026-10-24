import { UseFormReturn } from "react-hook-form";
import { RenameContractFormValues } from "../../../core/schemas/rename-contract-form.schema";

export interface RenameContractModalInput {
  isOpen: boolean;
  contractId: number;
  contractName: string;
  onClose: () => void;
  onSuccess?: (newName: string) => void;
}

export interface RenameContractModalProps extends RenameContractModalInput {
  form: UseFormReturn<RenameContractFormValues>;
  onSubmit: (values: RenameContractFormValues) => void;
  isSubmitting: boolean;
  onOpenChangeComplete?: (open: boolean) => void;
}
