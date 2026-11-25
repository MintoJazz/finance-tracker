import type { InstallmentListItem } from "@/modules/installments/models/schemas/installment-item.schema";
import type { AdjustInstallmentValuesValues } from "@/modules/installments/models/schemas/installment-values.schema";

export interface AdjustInstallmentValuesModalInput {
    installment: InstallmentListItem;
}

export interface AdjustInstallmentValuesModalProps {
    isOpen: boolean;
    installment: InstallmentListItem;
    onSubmit: (values: AdjustInstallmentValuesValues) => Promise<void>;
    onClose: () => void;
    onOpenChangeComplete: (open: boolean) => void;
}
