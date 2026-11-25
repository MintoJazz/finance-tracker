import type { ChangeInstallmentCategoryValues } from "@/modules/installments/models/schemas/installment-category.schema";
import type { InstallmentFormOptions } from "@/modules/installments/models/schemas/installment-form-options.schema";
import type { InstallmentListItem } from "@/modules/installments/models/schemas/installment-item.schema";

export interface ChangeInstallmentCategoryModalInput {
    installment: InstallmentListItem;
    options: InstallmentFormOptions;
}

export interface ChangeInstallmentCategoryModalProps {
    isOpen: boolean;
    installment: InstallmentListItem;
    options: InstallmentFormOptions;
    onSubmit: (values: ChangeInstallmentCategoryValues) => Promise<void>;
    onClose: () => void;
    onOpenChangeComplete: (open: boolean) => void;
}
