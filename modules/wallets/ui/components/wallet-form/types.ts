import type { UseFormReturn } from "react-hook-form";
import type { WalletFormValues } from "@/modules/wallets/models/wallet.schema";

export interface WalletFormProps {
    form: UseFormReturn<WalletFormValues>;
    onSubmit: (data: WalletFormValues) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
    submitText?: string;
    submitLoadingText?: string;
}
