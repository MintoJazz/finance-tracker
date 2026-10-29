import type { ContractFormValues } from "@/modules/contracts/models/contract-form.schema";

export interface ContractWizardProps {
  initialData?: Partial<ContractFormValues>;
  onSubmit: (data: ContractFormValues) => void | Promise<void>;
  onClose?: () => void;
  className?: string;
}
