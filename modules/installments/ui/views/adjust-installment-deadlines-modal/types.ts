import type { AdjustMonthlyDueDayValues } from "@/modules/installments/models/schemas/installment-deadlines.schema";
import type { InstallmentListItem } from "@/modules/installments/models/schemas/installment-item.schema";

export interface AdjustInstallmentDeadlinesModalInput {
    installment: InstallmentListItem;
}

export interface AdjustInstallmentDeadlinesModalProps {
    isOpen: boolean;
    installment: InstallmentListItem;
    onSubmit: (values: AdjustMonthlyDueDayValues) => Promise<void>;
    onClose: () => void;
    onOpenChangeComplete: (open: boolean) => void;
}
