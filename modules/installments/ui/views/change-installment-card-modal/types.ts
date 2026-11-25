import type { ChangeInstallmentCardValues } from "@/modules/installments/models/schemas/installment-card.schema";
import type {
    InstallmentCard,
    InstallmentListItem,
} from "@/modules/installments/models/schemas/installment-item.schema";

export interface ChangeInstallmentCardModalInput {
    installment: InstallmentListItem;
    cards: InstallmentCard[];
}

export interface ChangeInstallmentCardModalProps {
    isOpen: boolean;
    installment: InstallmentListItem;
    cards: InstallmentCard[];
    onSubmit: (values: ChangeInstallmentCardValues) => Promise<void>;
    onClose: () => void;
    onOpenChangeComplete: (open: boolean) => void;
}
