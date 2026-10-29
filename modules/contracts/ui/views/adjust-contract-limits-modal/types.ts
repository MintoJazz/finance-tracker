import { UseFormReturn } from "react-hook-form";
import { AdjustContractLimitsFormValues } from "@/modules/contracts/models/adjust-contract-limits-form.schema";

export interface AdjustContractLimitsModalInput {
  isOpen: boolean;
  contractId: number;
  contractName?: string;
  initialValue?: number;
  onClose: () => void;
  onSuccess?: (values: AdjustContractLimitsFormValues) => void;
}

export interface AdjustContractLimitsModalProps extends AdjustContractLimitsModalInput {
  form: UseFormReturn<AdjustContractLimitsFormValues>;
  onSubmit: (values: AdjustContractLimitsFormValues) => void;
  isSubmitting: boolean;
  onOpenChangeComplete?: (open: boolean) => void;
}
