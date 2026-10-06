import type { UseFormReturn } from "react-hook-form";
import type { CreateWalletFormValues } from "@/modules/account/core/schemas/wallet.schema";

export interface CreateWalletModalInput {
    defaultName?: string;
}

export interface CreateWalletModalProps {
    isOpen: boolean;
    isSubmitting: boolean;
    form: UseFormReturn<CreateWalletFormValues>;
    onSubmit: (data: CreateWalletFormValues) => void;
    onClose: () => void;
    onOpenChangeComplete?: (open: boolean) => void;
}

