import type { UseFormReturn } from "react-hook-form";
import type { ContractFormValues } from "../../../core/schemas/contract-form.schema";

export interface EditContractModalInput {
  id: number;
  defaultValues?: Partial<ContractFormValues>;
}

export interface EditContractModalProps {
  id: number;
  isOpen: boolean;
  isSubmitting: boolean;
  form: UseFormReturn<ContractFormValues>;
  onSubmit: (data: ContractFormValues) => void;
  onClose: () => void;
  onOpenChangeComplete?: (open: boolean) => void;
  initialValues: ContractFormValues;
}
