import type { InstallmentFormValues } from "@/modules/installments/models/schemas/installment-form.schema";
import type { InstallmentFormOptions } from "@/modules/installments/models/schemas/installment-form-options.schema";

export interface CreateInstallmentModalInput {
    options: InstallmentFormOptions;
    defaultValues?: Partial<InstallmentFormValues>;
}

export interface CreateInstallmentModalProps {
    isOpen: boolean;
    options: InstallmentFormOptions;
    initialData: InstallmentFormValues;
    onSubmit: (data: InstallmentFormValues) => Promise<void>;
    onClose: () => void;
    onOpenChangeComplete?: (open: boolean) => void;
}
