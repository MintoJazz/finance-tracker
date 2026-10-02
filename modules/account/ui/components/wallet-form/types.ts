import type { UseFormReturn } from "react-hook-form";
import type { CreateWalletFormValues } from "@/modules/account/core/schemas/wallet.schema";

export interface WalletFormProps {
    form: UseFormReturn<CreateWalletFormValues>;
    onSubmit: (data: CreateWalletFormValues) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
    submitText?: string;
    submitLoadingText?: string;
}
