import type { UseFormReturn } from "react-hook-form";
import type { CardFormValues } from "@/modules/account/core/schemas/card.schema";

export interface EditCardModalInput {
    id: number;
    defaultValues?: Partial<CardFormValues>;
}

export interface EditCardModalProps {
    isOpen: boolean;
    isSubmitting: boolean;
    form: UseFormReturn<CardFormValues>;
    onSubmit: (data: CardFormValues) => void;
    onClose: () => void;
    onOpenChangeComplete?: (open: boolean) => void;
}