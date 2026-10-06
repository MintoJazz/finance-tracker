import type { UseFormReturn } from "react-hook-form";
import type { CardFormValues } from "@/modules/account/core/schemas/card.schema";

export interface CardFormProps {
    form: UseFormReturn<CardFormValues>;
    onSubmit: (data: CardFormValues) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
    submitText?: string;
    submitLoadingText?: string;
}