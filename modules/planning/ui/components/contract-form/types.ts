import type { UseFormReturn } from "react-hook-form";
import type { ContractFormValues } from "../../../core/schemas/contract-form.schema";

export interface ContractFormProps {
  form: UseFormReturn<ContractFormValues>;
  onSubmit: (data: ContractFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitText?: string;
  submitLoadingText?: string;
}
