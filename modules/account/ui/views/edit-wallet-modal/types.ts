import type { UseFormReturn } from "react-hook-form";
import type { CreateWalletFormValues } from "@/modules/account/core/schemas/wallet.schema";

export interface EditWalletModalInput {
    id: number;
    defaultName?: string;
}

export interface EditWalletModalProps {
    isOpen: boolean;
    isSubmitting: boolean;
    form: UseFormReturn<CreateWalletFormValues>;
    onSubmit: (data: CreateWalletFormValues) => void;
    onClose: () => void;
}
