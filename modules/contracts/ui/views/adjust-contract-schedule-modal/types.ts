import { UseFormReturn } from "react-hook-form";
import { AdjustContractScheduleFormValues } from "@/modules/contracts/models/adjust-contract-schedule-form.schema";
import type { ContractFrequencyEnum } from "@/modules/contracts/models/contract-form.schema";

export interface AdjustContractScheduleModalInput {
  isOpen: boolean;
  contractId: number;
  contractName?: string;
  initialDueDay?: number;
  initialClosingDay?: number | null;
  initialDueMonth?: number | null;
  initialClosingMonth?: number | null;
  frequency?: ContractFrequencyEnum;
  onClose: () => void;
  onSuccess?: (values: AdjustContractScheduleFormValues) => void;
}

export interface AdjustContractScheduleModalProps extends AdjustContractScheduleModalInput {
  form: UseFormReturn<AdjustContractScheduleFormValues>;
  onSubmit: (values: AdjustContractScheduleFormValues) => void;
  isSubmitting: boolean;
  onOpenChangeComplete?: (open: boolean) => void;
}
