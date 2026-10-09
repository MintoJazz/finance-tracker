import type { ContractFormValues } from "../../../core/schemas/contract-form.schema";

export interface ContractWizardProps {
  initialData?: Partial<ContractFormValues>;
  onSubmit: (data: ContractFormValues) => void | Promise<void>;
  onClose?: () => void;
  className?: string;
}
