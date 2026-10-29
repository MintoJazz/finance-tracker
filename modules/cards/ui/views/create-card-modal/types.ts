import type { UseFormReturn } from "react-hook-form";
import type { CardFormValues } from "@/modules/cards/models/card.schema";

export interface CreateCardModalInput {
    defaultValues?: Partial<CardFormValues>;
}

export interface CreateCardModalProps {
    isOpen: boolean;
    isSubmitting: boolean;
    form: UseFormReturn<CardFormValues>;
    onSubmit: (data: CardFormValues) => void;
    onClose: () => void;
    onOpenChangeComplete?: (open: boolean) => void;
}