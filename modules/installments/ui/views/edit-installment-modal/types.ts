import type { UpdateInstallmentNameValues } from "@/modules/installments/models/schemas/installment-edit.schema";
import type { InstallmentListItem } from "@/modules/installments/models/schemas/installment-item.schema";

export interface EditInstallmentModalInput {
    installment: InstallmentListItem;
}

export interface EditInstallmentModalProps {
    isOpen: boolean;
    installment: InstallmentListItem;
    onSubmit: (values: UpdateInstallmentNameValues) => Promise<void>;
    onClose: () => void;
    onOpenChangeComplete: (open: boolean) => void;
}
